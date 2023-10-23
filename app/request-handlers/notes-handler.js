const fs = require('fs');
const path = require('path');
const glob = require('globby');
const express = require('express');
const exec = require('child_process').exec;
const readline = require('readline');

const promiseExec = (command) => new Promise((resolve, reject) => exec(command, (err, out, stderr) => {
    if (err) {
        reject(err);
    }

    if (stderr) {
        reject(stderr);
    }

    resolve(out);
}));

module.exports = (localApp, notesConfig, environmentOpts) => {
    environmentOpts = environmentOpts || {};
    notesConfig.path = notesConfig.path || 'content/notes';
    notesConfig.gitPath = notesConfig.gitPath || notesConfig.path;

    const newLine = '\n';
    const propMatch = /(^[a-zA-Z_]*):(.*)/;

    localApp.use('/notes', express.static(notesConfig.path, { maxAge: environmentOpts.maxAge || 0 }));

    async function getFileTag(file) {
        const latestRepoCommit = await promiseExec(`git -C "${notesConfig.gitPath}" rev-parse --short HEAD -- "${file.replace(notesConfig.path + '/', '')}"`);
        return `"${latestRepoCommit.trim()}"`;
    }

    async function getNotesRepoTag() {
        const latestRepoCommit = await promiseExec(`git -C "${notesConfig.gitPath}" rev-parse --short HEAD`);
        return `"${latestRepoCommit.trim()}"`;
    }

    async function parseNote(file) {
        parseNote.noteCache = parseNote.noteCache || {};

        const cacheNote = (note) => parseNote.noteCache[file] = note;

        const fileName = path.basename(file, '.md');

        const latestCommit = await getFileTag(file);

        const cachedNote = parseNote.noteCache[file];
        if (cachedNote && cachedNote.commit === latestCommit) return cachedNote;

        const newNote = {
            created: null,
            pathYear: fileName.substring(0, 4),
            pathMonth: fileName.substring(4, 6),
            pathDay: fileName.substring(6, 8),
            pathTitle: fileName.substring(9),
            hash: fileName,
            text: null,
            commit: latestCommit
        };

        const lineReader = readline.createInterface({ input: fs.createReadStream(file) });
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

        await new Promise((resolve) => lineReader.on('close', resolve));

        if (newNote.created !== null) return cacheNote(newNote);

        if (!notesConfig.gitPath) {
            newNote.created = new Date(newNote.pathYear, newNote.pathMonth, newNote.pathDay);
            return cacheNote(newNote);
        }

        const outputDate = await promiseExec('git -C "' + notesConfig.gitPath + '" log HEAD --format=%cD -- "' + file.replace(notesConfig.path + '/', '') + '" | tail -1');

        newNote.created = new Date(outputDate);

        return cacheNote(newNote);
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
            .sort((a, b) =>
                isFinite(a.created) && isFinite(b.created) ?
                    (a.created > b.created) - (a.created < b.created) :
                    NaN)
            .reverse();
    }

    localApp.get('/notes', async (req, res) => {
        try {
            const promisedTag = getNotesRepoTag();
            const promisedNotes = getNotes(1);

            res.set('ETag', await promisedTag);
            res.set('Cache-Control', 'public, max-age=0');
            res.render('notes/notes-container', { notes: await promisedNotes });
        } catch (exception) {
            console.log(exception);
            res.status(500).send('An error occurred');
        }
    });

    localApp.get(/^\/notes\/([0-9]{4})\/([0-9]{2})\/([0-9]{2})\/(.*)/, async (req, res) => {
        const year = req.params[0];
        const month = req.params[1];
        const day = req.params[2];
        const title = req.params[3];

        const filePath = path.join(notesConfig.path, year + month + day + '-' + title + '.md');

        try {
            const promisedTag = getFileTag(filePath);
            const promisedNote = parseNote(filePath);

            res.set('ETag', await promisedTag);
            res.set('Cache-Control', 'public, max-age=0');
            res.render('notes/note-container', { note: await promisedNote });
        } catch (exception) {
            console.error(exception);
            res.status(500).send('An error occurred');
        }
    });

    localApp.get(/^\/notes\/([0-9]*)/, async (req, res) => {
        const page = req.params[0];

        if (!page) {
            res.json([]);
            return;
        }

        try {
            const promisedTag = getNotesRepoTag();
            const promisedNotes = getNotes(page);

            res.set('ETag', await promisedTag);
            res.set('Cache-Control', 'public, max-age=0');
            res.json(await promisedNotes);
        } catch (exception) {
            console.log(exception);
            res.status(500).send('An error occurred');
        }
    });
};
