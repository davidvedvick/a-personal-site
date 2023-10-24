const fs = require('fs').promises;
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const favIcon = require('serve-favicon');
const methodOverride = require('method-override');
const notesHandler = require('./request-handlers/notes-handler');
const appConfig = require('./app-config.js');
const projectLoader = require('./request-handlers/project-loader');

const environmentOpts = {
    maxAge: 0
};

const app = express();
app.use('/', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
// app.use(favIcon());
// app.use(express.logger('dev'));
app.use(bodyParser());
app.use(methodOverride());

app.set('views', __dirname + '/views');
app.set('view engine', 'js');
app.engine('js', require('express-react-views').createEngine());

app.set('env', 'development');

// development only
app.use(require('errorhandler')());

app.get('/', async (_req, res) => {
  try {
    const bioMarkdown = await fs.readFile(appConfig.bio.path);
    res.render('index/index', { bio: bioMarkdown });
  } catch (exception) {
    console.error(exception);
  }
});

app.get('/projects', async (req, res) => {
  try {
    const projects = await projectLoader();

    res.render('project/project-list', { projects: projects });
  } catch (exception) {
    console.error(exception);
  }
});

app.get('/resume', async (req, res) => {
  try {
    const resumeMarkdown = await fs.readFile(appConfig.resumeLocation);
    res.render('resume/resume', { resume: resumeMarkdown });
  } catch (exception) {
    console.log(exception);
  }
});

notesHandler(app, appConfig.notes, environmentOpts);

app.listen(3000);

console.log('Server started: http://localhost:3000/');
