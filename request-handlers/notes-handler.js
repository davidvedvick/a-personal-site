var fs = require('fs');
var path = require('path');
var async = require('async');
var glob = require('glob');
var express = require('express');

module.exports = function(localApp, notesConfig, environmentOpts) {

    environmentOpts = environmentOpts || {};

    localApp.use('/notes/content', express.static(notesConfig.content, { maxAge: environmentOpts.maxAge || 0 }));

    var parseNote = function (file, callback) {
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) {
                callback(err);
                return;
            }

            var textLines = data.split('\n');

            var props = {};
            textLines
                .filter(function (line) {
                    return line.match(/^[a-zA-Z_]*\:.*/);
                })
                .forEach(function (line) {
                    var propName = line.split(':', 1);
                    props[propName] = line.replace(propName + ':', '').trim();
                });

            var fileName = path.basename(file, '.md');
            var newNote = {
                created: new Date(props.created_gmt || props.created),
                relativeCreated: new Date(props.created),
                pathYear: fileName.substring(0, 4),
                pathMonth: fileName.substring(4, 6),
                pathDay: fileName.substring(6, 8),
                pathTitle: fileName.substring(9),
                title: props.title
            };

            // Convention: treat first headline as start of note
            for (var i = 0; i < textLines.length; i++) {
                if (textLines[i].trim() !== '---') continue;

                newNote.text = textLines
                                    .slice(++i)
                                    // add back in the line returns
                                    .join('\n');

                break;
            }

            callback(null, newNote);
        });
    };

    var getNotes = function (page, onNotesLoaded) {
        const pageSize = 10;
        notesConfig.path = notesConfig.path || 'content/notes';

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
                            .sort(function(a, b) {
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

    localApp.get('/notes', function(req, res) {
        getNotes(1, function(err, notes) {
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

    localApp.get(/^\/notes\/([0-9]{4})\/([0-9]{2})\/([0-9]{2})\/(.*)/, function(req, res) {
        var year = req.params[0];
        var month = req.params[1];
        var day = req.params[2];
        var title = req.params[3];

        var filePath = path.join(notesConfig.path, year + month + day + '-' + title + '.md');

        parseNote(filePath, function(err, note) {
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

    localApp.get(/^\/notes\/([0-9]*)/, function(req, res) {
        var page = req.params[0];

        if (!page) {
            res.json([]);
            return;
        }

        getNotes(page, function(err, notes) {
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
