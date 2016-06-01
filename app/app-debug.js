var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var favIcon = require('serve-favicon');
var methodOverride = require('method-override');
var notesHandler = require('./request-handlers/notes-handler');
var appConfig = require('./app-config.json');

var environmentOpts = {
    maxAge: 0
};

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

app.get('/', (req, res) => {
    fs.readFile(appConfig.bio.path, (error, bioMarkdown) => {
        if (error) {
            console.log(error);
            return;
        }

        try {
            res.render('index/index', { bio: bioMarkdown });
        } catch (exception) {
            console.log(exception);
        }
    });
});

app.get('/projects', (req, res) => {
    fs.readFile(path.join(appConfig.projectsLocation, 'projects.json'), (error, rawProjectData) => {
        if (error) {
            console.error(error);
            return;
        }

        // inject the features markdown text into the project objects
        Promise.all(JSON.parse(rawProjectData).map(project => {
            return new Promise((resolve, reject) => {
                var filePath = path.join('content', 'projects', project.name, 'features.md');

                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    project.features = data;
                    resolve(project);
                });
            });
        })).then(projects => {
            try {
                res.render('project/project-list', { projects: projects });
            } catch (exception) {
                console.error(exception);
            }
        }).catch(console.error);
    });
});

app.get('/resume', (req, res) => {
    fs.readFile(appConfig.resumeLocation, (error, resumeMarkdown) => {
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

notesHandler(app, appConfig.notes, environmentOpts);

app.listen(3000);

console.log('Server started: http://localhost:3000/');
