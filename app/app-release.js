import path from 'path';
import express from 'express';
import notesHandler from './request-handlers/notes-handler.js';
import appConfig from './app-config.cjs';
import compression from 'compression';
import http from 'http';
import https from 'https';
import fs from 'fs';

const environmentOpts = {
    maxAge: 86400 * 1000
};

const app = express();
app.set('env', 'production');

const publicDir = path.join(__dirname, 'public');
const maxAge = environmentOpts.maxAge;

app.use(compression());
app.use('/', express.static(publicDir, { maxAge: maxAge }));
app.use('/app', express.static(publicDir, { maxAge: maxAge }));

// app.use(favIcon());
// app.use(express.logger('dev'));

app.set('view engine', 'js');

const staticHtmlDir = path.join(publicDir, 'html');

app.get('/', (req, res) => {
    res.sendFile(path.join(staticHtmlDir, 'index.html'), { maxAge: maxAge });
});

app.get('/projects', (req, res) => {
    res.sendFile(path.join(staticHtmlDir, 'project-list.html'), { maxAge: maxAge });
});

app.get('/resume', (req, res) => {
	res.sendFile(path.join(staticHtmlDir, 'resume.html'), { maxAge: maxAge });
});

if (appConfig.wellKnownLocation) app.use('/.well-known', express.static(appConfig.wellKnownLocation));

notesHandler(app, appConfig.notes, environmentOpts.maxAge);

http.createServer(app).listen(3000);

console.log('Server started: http://localhost:3000/');

if (appConfig.ssl) {
  const privateKey = fs.readFileSync(appConfig.ssl.privateKey);
  const certificate = fs.readFileSync(appConfig.ssl.certificate);
  https.createServer({ key: privateKey, cert: certificate }, app).listen(3433);
  console.log('Server started: http://localhost:3433/');
}