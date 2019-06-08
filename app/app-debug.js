var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var favIcon = require('serve-favicon');
var methodOverride = require('method-override');
const { promisify } = require('util');
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

app.set('views', __dirname + '/views');
app.set('view engine', 'js');
app.engine('js', require('express-react-views').createEngine());

// development only
if ('development' === app.get('env'))
    app.use(require('errorhandler')());

const promiseReadFile = (filePath) => promisify(fs.readFile)(filePath);

app.get('/', async (req, res) => {
  try {
    const bioMarkdown = await promiseReadFile(appConfig.bio.path);
    res.render('index/index', { bio: bioMarkdown });
  } catch (exception) {
    console.error(exception);
  }
});

app.get('/projects', async (req, res) => {
  try {
    const rawProjectData = await promiseReadFile(
      path.join(appConfig.projectsLocation, 'projects.json'));

    const projects = await Promise.all(JSON.parse(rawProjectData).map(async project => {
      const filePath = path.join(
        appConfig.projectsLocation,
        project.name,
        'features.md');

      project.features = await promisify(fs.readFile)(filePath, 'utf8');

      return project;
    }));

    res.render('project/project-list', { projects: projects });
  } catch (exception) {
    console.error(exception);
  }
});

app.get('/resume', async (req, res) => {
  try {
    const resumeMarkdown = await promiseReadFile(appConfig.resumeLocation);
    res.render('resume/resume', { resume: resumeMarkdown });
  } catch (exception) {
    console.log(exception);
  }
});

notesHandler(app, appConfig.notes, environmentOpts);

app.listen(3000);

console.log('Server started: http://localhost:3000/');
