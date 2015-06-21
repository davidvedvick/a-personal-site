var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var favIcon = require('serve-favicon');
var methodOverride = require('method-override');
var less = require('less');
var path = require('path');
var async = require('async');

var app = express();
app.use('/', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
// app.use(favIcon());
// app.use(express.logger('dev'));
app.use(bodyParser());
app.use(methodOverride());

app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

// development only
if ('development' === app.get('env'))
    app.use(require('errorhandler')());

app.get('/projects', function(req, res) {
    fs.readFile('content/projects/projects.json', function(error, rawProjectData) {
        if (error) {
            console.log(error);
            return;
        }

        var projects = JSON.parse(rawProjectData);

        // inject the features markdown text into the project objects
        async.forEachOf(
            projects,
            function (project, key, callback) {
                var filePath = path.join('content', 'projects', project.name, 'features.md');


                fs.readFile(filePath, 'utf8', function(err, data) {
                    if (!err)
                        project.features = data;

                    callback();
                });

            },
            function(err, results) {
                if (err) {
                    console.log(err);
                    return;
                }

                try {
                    res.render('project/project-list', { projects: projects });
                } catch (exception) {
                    console.log(exception);
                }
            }
        );
    });
});

app.get('/resume', function(req, res) {
    fs.readFile('content/resume.md', function(error, resumeMarkdown) {
        if (error) {
            console.log(error);
            return;
        }

        try {
            res.render('resume/resume', { resume: resumeMarkdown });
        } catch (exception) {
            console.log(exception);
        }
    });
});

app.get('/notes', function(req, res) {
    const notePath = 'content/notes/posts';
    fs.readdir(notePath, function(err, files) {
        if (err) {
            console.log(err);
            res.render(err);
            return;
        }

        // really hacky way to pull files back for now
        // need to filter out (or just delete) private files in the future
        var filesToRead = files
                            .sort()
                            .reverse()
                            .slice(0, 10);

        var parsedNotes = [];

        async.forEachOf(
            filesToRead,
            function(file, key, callback) {
                fs.readFile(path.join(notePath, file), 'utf8', function(err, data) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    var newNote = {
                        "date": new Date(file.substring(0, 4), file.substring(4,5), file.substring(6,7)),
                        "text": ""
                    };

                    var textLines = data.split('\n');

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
            function(err) {
                if (err) {
                    console.log(err);
                    return;
                }

                parsedNotes =
                    parsedNotes
                        .sort(function(a, b) {
                            return (
                                isFinite(a) &&
                                isFinite(b) ?
                                (a>b)-(a<b) :
                                NaN
                            );
                        });

                try {
                    res.render('notes/notes-list', { notes: parsedNotes });
                } catch (exception) {
                    console.log(exception);
                }
            }
        )
    });
});

app.listen(3000);

console.log('Server started: http://localhost:3000/');
