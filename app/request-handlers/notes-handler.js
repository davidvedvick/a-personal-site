const fs = require('fs');
const path = require('path');
const glob = require('globby');
const express = require('express');
const exec = require('child_process').exec;
const readline = require('readline');
const { promisify } = require('util');

const promiseExec = (command) => promisify(exec)(command);

module.exports = (localApp, notesConfig, environmentOpts) => {
    environmentOpts = environmentOpts || {};
    notesConfig.path = notesConfig.path || 'content/notes';

    const newLine = '\n';

    localApp.use('/notes/content', express.static(notesConfig.content, { maxAge: environmentOpts.maxAge || 0 }));

    async function* fileReaderIterator(file) {
        const readStream = fs.createReadStream(file, { encoding: 'utf8', highWaterMark: 1024 });
        const readBytesPromise = () => new Promise((resolve, reject) => {
            const reader = () => {
                resolve(readStream.read(1024));
                readStream.removeListener('readable', reader);
            };
            readStream.on('readable', reader);
        });

        let previous = '';
        let next;
        while ((next = await readBytesPromise())) {
            previous += next;
            let eolIndex = -1;
            while ((eolIndex = previous.indexOf('\n')) >= 0) {
                const line = previous.slice(0, eolIndex);
                yield line;
                previous = previous.slice(eolIndex + 1);
            }
        }

        if (previous.length > 0) {
            yield previous;
        }
    };

    async function parseNote(file) {
        parseNote.propMatch = parseNote.propMatch || /(^[a-zA-Z_]*)\:(.*)/;

        parseNote.noteCache = parseNote.noteCache || {};

        const cacheNote = (note) => parseNote.noteCache[file] = note;

        const fileName = path.basename(file, '.md');

        const latestCommit = await promiseExec('git -C "' + notesConfig.gitPath + '" log HEAD --format=%H -1 -- "' + file.replace(notesConfig.path + '/', '') + '" | tail -1');

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

        const lineReader = fileReaderIterator(file);
        for await (const line of lineReader) {
            // `newNote.text` is not null, so we are now able to add text
            if (newNote.text != null) {
                newNote.text += line + newLine;
                continue;
            }

            if (line.trim() === '---') {
                // Begin adding the text
                newNote.text = '';
                continue;
            }

            const matches = parseNote.propMatch.exec(line);
            if (!matches) continue;

            const propName = matches[1];
            const value = matches[2].trim();

            switch (propName) {
                case 'created_gmt':
                    newNote.created = new Date(value);
                    continue;
                case 'title':
                    newNote.title = value;
                    continue;
            }
        }

        if (newNote.created !== null) return cacheNote(newNote);

        if (!notesConfig.gitPath) {
            newNote.created = new Date(newNote.pathYear, newNote.pathMonth, newNote.pathDay);
            return cacheNote(newNote);
        }

        newNote.created = await promiseExec('git -C "' + notesConfig.gitPath + '" log HEAD --format=%cD -- "' + file.replace(notesConfig.path + '/', '') + '" | tail -1');

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
            res.render('notes/notes-container', { notes: await getNotes(1) });
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
            res.render('notes/note-container', { note: await parseNote(filePath) });
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
            res.json(await getNotes(page));
        } catch (exception) {
            console.log(exception);
            res.status(500).send('An error occurred');
        }
    });
};
