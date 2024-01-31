import { promises as fs } from 'fs';
import path from 'path';
import express from 'express';
import favIcon from 'serve-favicon';
import methodOverride from 'method-override';
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import errorHandler from 'errorhandler';
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
import React from "react";

import notesHandler from './request-handlers/notes-handler.js';
import appConfig from './app-config.cjs';
import projectLoader from './request-handlers/project-loader.js';
import index from './views/index/index.js';
import projectList from './views/project/project-list.js';
import resume from './views/resume/resume.js';
import {watch} from "./gulpfile.js";
import { renderToStaticMarkup } from 'react-dom/server';
import bodyParser from "body-parser";

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
app.use(errorHandler());

const docType = '<!DOCTYPE html>';
function renderElement(element, options) {
  const markup = renderToStaticMarkup(React.createElement(element, options));
  return docType + markup;
}

app.get('/', async (_req, res) => {
  try {
    const bioMarkdown = await fs.readFile(appConfig.bio.path);
    res.send(renderElement(index, { bio: bioMarkdown }));
  } catch (exception) {
    console.error(exception);
  }
});

app.get('/projects', async (req, res) => {
  try {
    const projects = await projectLoader();
    res.send(renderElement(projectList, { projects: projects }))
  } catch (exception) {
    console.error(exception);
  }
});

app.get('/resume', async (req, res) => {
  try {
    const resumeMarkdown = await fs.readFile(appConfig.resumeLocation);
    res.send(renderElement(resume, { resume: resumeMarkdown }))
  } catch (exception) {
    console.log(exception);
  }
});

notesHandler(app, appConfig.notes, environmentOpts);

app.listen(3000);

watch();

console.log('Server started: http://localhost:3000/');
