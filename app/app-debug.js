const fs = require('fs').promises;
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const favIcon = require('serve-favicon');
const methodOverride = require('method-override');
const ReactDOMServer = require("react-dom/server");
const appConfig = require('./app-config.js');
const projectLoader = require('./request-handlers/project-loader');

require("@babel/register")({
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          "node": 16
        },
      }
    ],
    '@babel/preset-react'
  ],
  plugins: ['@babel/transform-flow-strip-types'],
});
const notesHandler = require('./request-handlers/notes-handler');
const index = require('./views/index/index');
const projectList = require('./views/project/project-list');
const resume = require('./views/resume/resume');

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

app.set('env', 'development');

// development only
app.use(require('errorhandler')());

const docType = '<!DOCTYPE html>';
function renderElement(element, options) {
  const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(element, options));
  return docType + markup;
}

app.get('/', async (_req, res) => {
  try {
    const bioMarkdown = await fs.readFile(appConfig.bio.path);
    res.send(renderElement(index.default, { bio: bioMarkdown }));
  } catch (exception) {
    console.error(exception);
  }
});

app.get('/projects', async (req, res) => {
  try {
    const projects = await projectLoader();
    res.send(renderElement(projectList.default, { projects: projects }))
  } catch (exception) {
    console.error(exception);
  }
});

app.get('/resume', async (req, res) => {
  try {
    const resumeMarkdown = await fs.readFile(appConfig.resumeLocation);
    res.send(renderElement(resume.default, { resume: resumeMarkdown }))
  } catch (exception) {
    console.log(exception);
  }
});

notesHandler.default(app, appConfig.notes, environmentOpts);

app.listen(3000);

console.log('Server started: http://localhost:3000/');
