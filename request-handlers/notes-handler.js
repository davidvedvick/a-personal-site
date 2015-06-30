var fs = require('fs');
var path = require('path');
var async = require('async');
var glob = require('glob');

module.exports = function(localApp, notesPath) {
    var getNotes = function(page, onNotesLoaded) {
        const pageSize = 10;
        notesPath = notesPath || 'content/notes';

        glob(path.join(notesPath, '*.md'), function(err, files) {
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
                function(file, key, callback) {
                    fs.readFile(file, 'utf8', function(err, data) {
                        if (err) {
                            callback(err);
                            return;
                        }

                        var textLines = data.split('\n');


                        var props = {};
                        textLines
                            .filter(function(line) {
                                return line.match(/^[a-zA-Z_]*\:.*/);
                            })
                            .forEach(function(line) {
                                var propName = line.split(':', 1);
                                props[propName] = line.replace(propName + ':', '').trim();
                            });

                        var newNote = {
                            created: new Date(props.created_gmt || props.created),
                        };

                        // Convention: treat first headline as start of note
                        for (var i = 0; i < textLines.length; i++) {
                            if (textLines[i].trim()[0] !== '#') continue;

                            newNote.text = textLines
                                                .slice(i)
                                                // trim any other text
                                                .map(function(line) {
                                                    return line.trim();
                                                })
                                                // add back in the line returns
                                                .join('\n');

                            break;
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
