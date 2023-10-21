const path = require('path');
const express = require('express');
const notesHandler = require('./request-handlers/notes-handler');
const appConfig = require('./app-config.js');
const compression = require('compression');
const http = require('http');

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

app.engine('js', require('express-react-views').createEngine({ transformViews: false }));

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
  const https = require('https');
  const fs = require('fs');
  const privateKey = fs.readFileSync(appConfig.ssl.privateKey);
  const certificate = fs.readFileSync(appConfig.ssl.certificate);
  https.createServer({ key: privateKey, cert: certificate }, app).listen(3433);
  console.log('Server started: http://localhost:3433/');
}