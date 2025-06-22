import fs from 'fs';
import path from 'path';
import glob from 'globby';
import express from 'express';
import {exec} from 'child_process';
import readline from 'readline';
import React from "react";
import NoteContainer from '../views/notes/note-container.js';
import NotesContainer from "../views/notes/notes-container.js";
import { renderToStaticMarkup } from 'react-dom/server';
import {NotesRssFeed} from "../views/notes/notes-rss-feed.js";
import PromisingRateLimiter from "./promising-rate-limiter.js";

const eTagKey = 'ETag'
const ifNoneMatchKey = 'If-None-Match';
const rootNotesPath = '/notes';

function getMatchTag(req) {
  return req.get(ifNoneMatchKey);
}

const commandRateLimiter = new PromisingRateLimiter(4);

const promiseExec = (command) => commandRateLimiter.limit(() => new Promise((resolve, reject) => exec(command, (err, out, stderr) => {
  if (err) {
    reject(err);
  }

  if (stderr) {
    reject(stderr);
  }

  resolve(out);
})));

const noteCache = new Map();
function cacheNote(file, note) {
  noteCache.set(file, note);
  return note;
}

export default function (localApp, notesConfig, environmentOpts) {
  environmentOpts = environmentOpts || {};
  notesConfig.path = notesConfig.path || 'content/notes';
  notesConfig.gitPath = notesConfig.gitPath || notesConfig.path;

  const newLine = '\n';
  const propMatch = /(^[a-zA-Z_]*):(.*)/;
  const cachedHtml = new Map();

  localApp.use('/notes', express.static(notesConfig.path, {maxAge: environmentOpts.maxAge || 0}));

  async function isFileAccessible(file) {
    try {
      await fs.promises.access(file, fs.constants.R_OK);
      return true;
    } catch (e) {
      console.warn(`An error occurred checking if ${file} is accessible.`, e);
      return false;
    }
  }

  async function getFileTag(file) {
    const latestRepoCommit = await promiseExec(`git -C "${notesConfig.gitPath}" rev-parse --short HEAD -- "${file.replace(notesConfig.path + '/', '')}"`);
    return `"${latestRepoCommit.trim()}"`;
  }

  async function getNotesRepoTag() {
    const latestRepoCommit = await promiseExec(`git -C "${notesConfig.gitPath}" rev-parse --short HEAD`);
    return `"${latestRepoCommit.trim()}"`;
  }

  async function parseNote(file) {
    const latestCommit = await getFileTag(file);

    const cachedNote = noteCache.get(file);
    if (cachedNote && cachedNote.commit === latestCommit) return cachedNote;

    if (!await isFileAccessible(file)) {
      return null;
    }

    const fileName = path.basename(file, '.md');

    const newNote = await new Promise((resolve, reject) => {
      const pathYear = fileName.substring(0, 4);
      const pathMonth = fileName.substring(4, 6);
      const pathDay = fileName.substring(6, 8);
      const pathTitle = fileName.substring(9);

      const newNote = {
        created: null,
        pathYear: pathYear,
        pathMonth: pathMonth,
        pathDay: pathDay,
        pathTitle: pathTitle,
        path: `${rootNotesPath}/${pathYear}/${pathMonth}/${pathDay}/${pathTitle}`,
        hash: fileName,
        text: null,
        commit: latestCommit
      };

      const lineReader = readline.createInterface({input: fs.createReadStream(file)});

      lineReader.on('error', reject);
      lineReader.on('close', () => resolve(newNote));

      lineReader.on('line', (line) => {
        // `newNote.text` is not null, so we are now able to add text
        if (newNote.text != null) {
          newNote.text += line + newLine;
          return;
        }

        if (line.trim() === '---') {
          // Begin adding the text
          newNote.text = '';
          return;
        }

        const matches = propMatch.exec(line);
        if (!matches) return;

        const propName = matches[1];
        const value = matches[2].trim();

        switch (propName) {
          case 'created_gmt':
            newNote.created = new Date(value);
            return;
          case 'title':
            newNote.title = value;
            return;
        }
      });
    });

    if (newNote.created !== null) return cacheNote(file, newNote);

    if (!notesConfig.gitPath) {
      newNote.created = new Date(newNote.pathYear, newNote.pathMonth, newNote.pathDay);
      return cacheNote(file, newNote);
    }

    const outputDate = await promiseExec(`git -C "${notesConfig.gitPath}" log HEAD --format=%cD -- "${file.replace(notesConfig.path + '/', '')}" | tail -1`);

    newNote.created = new Date(outputDate);

    return cacheNote(file, newNote);
  }

  async function getNotes(page) {
    const pageSize = 10;

    const files = await glob(path.join(notesConfig.path, '*.md'));

    const startIndex = (page - 1) * pageSize;

    // really hacky way to pull files back for now
    const filesToRead = files
      .sort()
      .reverse()
      .slice(startIndex, startIndex + pageSize);

    const parsedNotes = await Promise.all(filesToRead.map((f) => parseNote(f)));
    return parsedNotes
      .filter(n => n != null)
      .sort((a, b) => isFinite(a.created) && isFinite(b.created) ? (a.created > b.created) - (a.created < b.created) : NaN)
      .reverse();
  }

  async function getAllNotes() {
    const files = await glob(path.join(notesConfig.path, '*.md'));

    // really hacky way to pull files back for now
    const filesToRead = files
      .sort()
      .reverse();

    const parsedNotes = await Promise.all(filesToRead.map((f) => parseNote(f)));
    return parsedNotes
      .filter(n => n != null)
      .sort((a, b) => isFinite(a.created) && isFinite(b.created) ? (a.created > b.created) - (a.created < b.created) : NaN)
      .reverse();
  }

  localApp.get(rootNotesPath, async (req, res) => {
    try {
      const cacheTag = await getNotesRepoTag();
      if (getMatchTag(req) === cacheTag) {
        res.sendStatus(304);
        return;
      }

      res.set(eTagKey, cacheTag);
      res.set('Cache-Control', 'public, max-age=0');

      const cachedPageTagPair = cachedHtml.get(req.path);
      if (cachedPageTagPair) {
        const [cachedTag, cachedPage] = cachedPageTagPair;
        if (cacheTag === cachedTag) {
          res.send(cachedPage);
          return;
        }
      }

      const promisedNotes = getNotes(1);
      const component = NotesContainer;

      let markup = '<!DOCTYPE html>';
      markup += renderToStaticMarkup(React.createElement(component, {notes: await promisedNotes}));

      cachedHtml.set(req.path, [cacheTag, markup]);

      res.send(markup);
    } catch (exception) {
      console.log(exception);
      res.status(500).send('An error occurred');
    }
  });

  localApp.get(`${rootNotesPath}/rss.xml`, async (req, res) => {
    try {
      const cacheTag = await getNotesRepoTag();
      if (getMatchTag(req) === cacheTag) {
        res.sendStatus(304);
        return;
      }

      res.type('application/xml');
      res.set(eTagKey, cacheTag);
      res.set('Cache-Control', 'public, max-age=0');

      const cachedPageTagPair = cachedHtml.get(req.path);
      if (cachedPageTagPair) {
        const [cachedTag, cachedPage] = cachedPageTagPair;
        if (cacheTag === cachedTag) {
          res.send(cachedPage);
          return;
        }
      }

      const promisedNotes = getAllNotes();
      const rootUrl = req.protocol + '://' + req.get('host')

      let markup = '<?xml version="1.0" encoding="UTF-8" ?>\n';
      markup += NotesRssFeed(rootUrl, await promisedNotes);

      cachedHtml.set(req.path, [cacheTag, markup]);

      res.send(markup);
    } catch (exception) {
      console.log(exception);
      res.status(500).send('An error occurred');
    }
  });

  localApp.get(new RegExp(`^${rootNotesPath}/([0-9]{4})/([0-9]{2})/([0-9]{2})/([\\w\\-]*)`), async (req, res) => {
    const year = req.params[0];
    const month = req.params[1];
    const day = req.params[2];
    const title = req.params[3];

    const filePath = path.join(notesConfig.path, year + month + day + '-' + title + '.md');

    try {
      const cacheTag = await getFileTag(filePath);
      if (getMatchTag(req) === cacheTag) {
        res.sendStatus(304);
        return;
      }

      res.set(eTagKey, cacheTag);
      res.set('Cache-Control', 'public, max-age=0');

      const cachedPageTagPair = cachedHtml.get(req.path);
      if (cachedPageTagPair) {
        const [cachedTag, cachedPage] = cachedPageTagPair;
        if (cacheTag === cachedTag) {
          res.send(cachedPage);
          return;
        }
      }

      const note = await parseNote(filePath);
      if (!note) {
        res.status(404).send("Where are you going?");
        return;
      }

      let markup = '<!DOCTYPE html>';
      const component = NoteContainer;
      markup += renderToStaticMarkup(React.createElement(component, {note: note}));

      cachedHtml.set(req.path, [cacheTag, markup]);

      res.send(markup);
    } catch (exception) {
      console.error(exception);
      res.status(500).send('An error occurred');
    }
  });

  localApp.get(new RegExp(`^${rootNotesPath}/([0-9]+)`), async (req, res) => {
    const page = req.params[0];

    if (!page) {
      res.json([]);
      return;
    }

    try {
      const cacheTag = await getNotesRepoTag();
      if (getMatchTag(req) === cacheTag) {
        res.sendStatus(304);
        return;
      }

      const promisedNotes = getNotes(page);

      res.set(eTagKey, cacheTag);
      res.set('Cache-Control', 'public, max-age=0');
      res.json(await promisedNotes);
    } catch (exception) {
      console.log(exception);
      res.status(500).send('An error occurred');
    }
  });
};
