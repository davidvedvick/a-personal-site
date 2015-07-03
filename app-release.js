var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var favIcon = require('serve-favicon');
var methodOverride = require('method-override');
var less = require('less');
var path = require('path');
var async = require('async');
var notesHandler = require('./request-handlers/notes-handler');
var appConfig = require('./app-config.json');
var compression = require('compression');

var app = express();
app.set('env', 'release');

var publicDir = path.join(__dirname, 'public');
const maxAge = 60 * 60 * 1000; //one hour

app.use(compression());
app.use('/', express.static(publicDir, { maxAge: maxAge }));

app.use(bodyParser.json());
// app.use(favIcon());
// app.use(express.logger('dev'));
app.use(bodyParser());
app.use(methodOverride());

app.set('view engine', 'jsx');

app.engine('jsx', require('express-react-views').createEngine());

var staticHtmlDir = path.join(publicDir, 'html');

app.get('/', function(req, res) {
    res.sendFile(path.join(staticHtmlDir, 'index.html'), { maxAge: maxAge });
});

app.get('/projects', function(req, res) {
    res.sendFile(path.join(staticHtmlDir, 'project-list.html'), { maxAge: maxAge });
});

app.get('/resume',function (req, res) {
	res.sendFile(path.join(staticHtmlDir, 'resume.html'), { maxAge: maxAge });
});

notesHandler(app, appConfig.notesLocation);

app.listen(3000);

console.log('Server started: http://localhost:3000/');
