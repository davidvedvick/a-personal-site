var fs = require('fs');
var path = require('path');
var glob = require('globby');
var express = require('express');
var exec = require('child_process').exec;
var readline = require('readline');

module.exports = (localApp, notesConfig, environmentOpts) => {

    environmentOpts = environmentOpts || {};
    notesConfig.path = notesConfig.path || 'content/notes';

	var newLine = '\n';

    localApp.use('/notes/content', express.static(notesConfig.content, { maxAge: environmentOpts.maxAge || 0 }));

    var parseNote = (file) => {
        parseNote.propMatch = parseNote.propMatch || /(^[a-zA-Z_]*)\:(.*)/;

        parseNote.noteCache = parseNote.noteCache || {};

        return new Promise((resolve, reject) => {
            var fileName = path.basename(file, '.md');

            var cacheAndResolveNote = (note) => {
                parseNote.noteCache[file] = note;
                resolve(note);
            };

            exec('git -C "' + notesConfig.gitPath + '" log HEAD --format=%H -- "' + file.replace(notesConfig.path + '/', '') + '" | tail -1',
                (error, stdout, stderr) => {
                    var latestCommit = stdout;
                    if (error !== null) {
                        reject(error);
                        return;
                    }

                    var cachedNote = parseNote.noteCache[file];
                    if (cachedNote && cachedNote.commit === latestCommit) {
                        resolve(cachedNote);
                        return;
                    }

                    var newNote = {
                        created: null,
                        pathYear: fileName.substring(0, 4),
                        pathMonth: fileName.substring(4, 6),
                        pathDay: fileName.substring(6, 8),
                        pathTitle: fileName.substring(9),
                        hash: fileName,
                        text: null,
                        commit: latestCommit
                    };

                    var lineReader = readline.createInterface({ input: fs.createReadStream(file) });
                    lineReader.on('line', line => {
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

                        var matches = parseNote.propMatch.exec(line);
                        if (!matches) return;

                        var propName = matches[1];
                        var value = matches[2].trim();

                        switch (propName) {
                            case 'created_gmt':
                                newNote.created = new Date(value);
                                return;
                            case 'title':
                                newNote.title = value;
                                return;
                        }
                    });

                    lineReader.on('close', () => {
                        if (newNote.created !== null) {
                            cacheAndResolveNote(newNote);
                            return;
                        }

                        if (!notesConfig.gitPath) {
                            newNote.created = new Date(newNote.pathYear, newNote.pathMonth, newNote.pathDay);
                            cacheAndResolveNote(newNote);
                            return;
                        }

                        exec('git -C "' + notesConfig.gitPath + '" log HEAD --format=%cD -- "' + file.replace(notesConfig.path + '/', '') + '" | tail -1',
                            (error, stdout, stderr) => {
                                if (error !== null) {
                                    reject(error);
                                    return;
                                }

                                newNote.created = new Date(stdout);
                                cacheAndResolveNote(newNote);
                            }
                        );
                    });
                }
            );
        });
    };

    var getNotes = (page) => {
        const pageSize = 10;

        return glob(path.join(notesConfig.path, '*.md')).then(files => {
            const startIndex = (page - 1) * pageSize;

            // really hacky way to pull files back for now
            const filesToRead = files
                                .sort()
                                .reverse()
                                .slice(startIndex, startIndex + pageSize);

            return Promise.all(filesToRead.map(f => parseNote(f)))
                .then(parsedNotes =>
                    parsedNotes
                        .sort((a, b) =>
                            isFinite(a.created) && isFinite(b.created) ?
                                (a.created > b.created) - (a.created < b.created) :
                                NaN)
                        .reverse());
        });
    };

    localApp.get('/notes', (req, res) => {
        getNotes(1).then(notes => {
            try {
                res.render('notes/notes-container', { notes: notes });
            } catch (exception) {
                console.log(exception);
            }
        }).catch(console.error);
    });

    localApp.get(/^\/notes\/([0-9]{4})\/([0-9]{2})\/([0-9]{2})\/(.*)/, (req, res) => {
        var year = req.params[0];
        var month = req.params[1];
        var day = req.params[2];
        var title = req.params[3];

        var filePath = path.join(notesConfig.path, year + month + day + '-' + title + '.md');

        parseNote(filePath).then(note => {
            try {
                res.render('notes/note-container', { note: note });
            } catch (exception) {
                console.error(exception);
            }
        }).catch(console.error);
    });

    localApp.get(/^\/notes\/([0-9]*)/, (req, res) => {
        var page = req.params[0];

        if (!page) {
            res.json([]);
            return;
        }

        getNotes(page).then(notes => {
            try {
                res.json(notes);
            } catch (exception) {
                console.error(exception);
            }
        }).catch(console.error);
    });
};
