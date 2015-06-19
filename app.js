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

app.use('/projects', function(req, res) {
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

app.use('/resume', function(req, res) {
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

app.listen(3000);

console.log('Server started: http://localhost:3000/');
