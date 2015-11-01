var fs = require('fs');
var path = require('path');
var async = require('async');
var glob = require('glob');
var express = require('express');
var exec = require('child_process').exec;

module.exports = function (localApp, notesConfig, environmentOpts) {

    environmentOpts = environmentOpts || {};
    notesConfig.path = notesConfig.path || 'content/notes';

    localApp.use('/notes/content', express.static(notesConfig.content, { maxAge: environmentOpts.maxAge || 0 }));

    var parseNote = function (file, callback) {
        parseNote.propMatch = /(^[a-zA-Z_]*)\:(.*)/;

        fs.readFile(file, 'utf8', function (err, data) {
            if (err) {
                callback(err);
                return;
            }

            var textLines = data.split('\n');

            var props = {};

            var fileName = path.basename(file, '.md');

            var newNote = {
                created: null,
                pathYear: fileName.substring(0, 4),
                pathMonth: fileName.substring(4, 6),
                pathDay: fileName.substring(6, 8),
                pathTitle: fileName.substring(9)
            };

            var lineNumber = 0;
            for (var i = lineNumber; i < textLines.length; i++) {
                lineNumber = i;
                var line = textLines[i];

                if (line.trim() === '---') break;

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

            newNote.text = textLines
                                .slice(lineNumber + 1)
                                // add back in the line returns
                                .join('\n');

            if (newNote.created !== null) {
                callback(null, newNote);
                return;
            }

            if (!notesConfig.gitPath) {
                newNote.created = new Date(newNote.pathYear, newNote.pathMonth, newNote.pathDay);
                callback(null, newNote);
                return;
            }

            exec('git -C "' + notesConfig.gitPath + '" log HEAD --format=%cD -- "' + file.replace(notesConfig.path + '/', '') + '" | tail -1',
                function (error, stdout, stderr) {
                    if (error !== null) {
                        callback(error);
                        return;
                    }

                    newNote.created = new Date(stdout);
                    callback(null, newNote);
                }
            );
        });
    };

    var getNotes = function (page, onNotesLoaded) {
        const pageSize = 10;

        glob(path.join(notesConfig.path, '*.md'), function (err, files) {
            if (err) {
                console.log(err);
                onNotesLoaded(err);
                return;
            }

            var startIndex = (page - 1) * pageSize;
            // really hacky way to pull files back for now
            // need to filter out (or just delete) private files in the future
            var filesToRead = files
                                .sort()
                                .reverse()
                                .slice(startIndex, startIndex + pageSize);

            var parsedNotes = [];

            async.forEachOf(
                filesToRead,
                function (file, key, callback) {
                    parseNote(file, function (err, newNote) {
                        if (err) {
                            callback(err);
                            return;
                        }

                        parsedNotes.push(newNote);
                        callback();
                    });
                },
                function (error, results) {
                    if (error) {
                        onNotesLoaded(error);
                        return;
                    }

                    parsedNotes =
                        parsedNotes
                            .sort(function (a, b) {
                                return isFinite(a.created) && isFinite(b.created) ?
                                    (a.created > b.created) - (a.created < b.created) :
                                    NaN;
                            })
                            .reverse();

                    onNotesLoaded(error, parsedNotes);
                }
            );
        });
    };

    localApp.get('/notes', function (req, res) {
        getNotes(1, function (err, notes) {
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

    localApp.get(/^\/notes\/([0-9]{4})\/([0-9]{2})\/([0-9]{2})\/(.*)/, function (req, res) {
        var year = req.params[0];
        var month = req.params[1];
        var day = req.params[2];
        var title = req.params[3];

        var filePath = path.join(notesConfig.path, year + month + day + '-' + title + '.md');

        parseNote(filePath, function (err, note) {
            if (err) {
                console.log(err);
                return;
            }

            try {
                res.render('notes/note-container', { note: note });
            } catch (exception) {
                console.log(exception);
            }
        });
    });

    localApp.get(/^\/notes\/([0-9]*)/, function (req, res) {
        var page = req.params[0];

        if (!page) {
            res.json([]);
            return;
        }

        getNotes(page, function (err, notes) {
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
