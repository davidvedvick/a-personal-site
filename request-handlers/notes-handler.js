var fs = require('fs');
var path = require('path');
var glob = require('globby');
var express = require('express');
var exec = require('child_process').exec;

module.exports = (localApp, notesConfig, environmentOpts) => {

    environmentOpts = environmentOpts || {};
    notesConfig.path = notesConfig.path || 'content/notes';

    localApp.use('/notes/content', express.static(notesConfig.content, { maxAge: environmentOpts.maxAge || 0 }));

    var parseNote = (file) => {
        parseNote.propMatch = /(^[a-zA-Z_]*)\:(.*)/;

        return new Promise((resolve, reject) => {
            fs.readFile(file, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                var fileName = path.basename(file, '.md');
                var newNote = {
                    created: null,
                    pathYear: fileName.substring(0, 4),
                    pathMonth: fileName.substring(4, 6),
                    pathDay: fileName.substring(6, 8),
                    pathTitle: fileName.substring(9)
                };

                var textLines = data.split('\n');
                for (var i = 0; i < textLines.length; i++) {
                    var line = textLines[i];

                    if (line.trim() === '---') {
                        // add back in the line returns
                        newNote.text = textLines.slice(i + 1).join('\n');
                        break;
                    }

                    var matches = parseNote.propMatch.exec(line);
                    if (!matches) continue;

                    var propName = matches[1];
                    var value = matches[2].trim();

                    switch (propName) {
                        case 'created_gmt':
                            newNote.created = new Date(value);
                            break;
                        case 'title':
                            newNote.title = value;
                            break;
                    }
                }

                if (newNote.created !== null) {
                    resolve(newNote);
                    return;
                }

                if (!notesConfig.gitPath) {
                    newNote.created = new Date(newNote.pathYear, newNote.pathMonth, newNote.pathDay);
                    resolve(newNote);
                    return;
                }

                exec('git -C "' + notesConfig.gitPath + '" log HEAD --format=%cD -- "' + file.replace(notesConfig.path + '/', '') + '" | tail -1',
                    function (error, stdout, stderr) {
                        if (error !== null) {
                            reject(error);
                            return;
                        }

                        newNote.created = new Date(stdout);
                        resolve(newNote);
                    }
                );
            });
        });
    };

    var getNotes = (page, onNotesLoaded) => {
        const pageSize = 10;

        glob(path.join(notesConfig.path, '*.md')).then(files => {
            var startIndex = (page - 1) * pageSize;

            // really hacky way to pull files back for now
            var filesToRead = files
                                .sort()
                                .reverse()
                                .slice(startIndex, startIndex + pageSize);

            Promise.all(filesToRead.map(f => parseNote(f)))
                .then(parsedNotes => {
                    parsedNotes =
                        parsedNotes
                            .sort(function (a, b) {
                                return isFinite(a.created) && isFinite(b.created) ?
                                    (a.created > b.created) - (a.created < b.created) :
                                    NaN;
                            })
                            .reverse();

                    onNotesLoaded(null, parsedNotes);
                }).catch(onNotesLoaded);
        }).catch(err => {
            console.log(err);
            onNotesLoaded(err);
        });
    };

    localApp.get('/notes', (req, res) => {
        getNotes(1, (err, notes) => {
            if (err) {
                console.log(err);
                return;
            }

            try {
                res.render('notes/notes-container', { notes: notes });
            } catch (exception) {
                console.log(exception);
            }
        });
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
                console.log(exception);
            }
        }).catch(console.log);
    });

    localApp.get(/^\/notes\/([0-9]*)/, (req, res) => {
        var page = req.params[0];

        if (!page) {
            res.json([]);
            return;
        }

        getNotes(page, (err, notes) => {
            if (err) {
                console.log(err);
                return;
            }

            try {
                res.json(notes);
            } catch (exception) {
                console.log(exception);
            }
        });
    });
};
