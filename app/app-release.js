var path = require('path');
var express = require('express');
var notesHandler = require('./request-handlers/notes-handler');
var appConfig = require('./app-config.json');
var compression = require('compression');

var environmentOpts = {
    maxAge: 86400 * 1000
};

var app = express();
app.set('env', 'production');

var publicDir = path.join(__dirname, 'public');
var maxAge = environmentOpts.maxAge;

app.use(compression());
app.use('/', express.static(publicDir, { maxAge: maxAge }));

// app.use(favIcon());
// app.use(express.logger('dev'));

app.set('view engine', 'js');

app.engine('js', require('express-react-views').createEngine({ transformViews: false }));

var staticHtmlDir = path.join(publicDir, 'html');

app.get('/', function (req, res) {
    res.sendFile(path.join(staticHtmlDir, 'index.html'), { maxAge: maxAge });
});

app.get('/projects', function (req, res) {
    res.sendFile(path.join(staticHtmlDir, 'project-list.html'), { maxAge: maxAge });
});

app.get('/resume', function (req, res) {
	res.sendFile(path.join(staticHtmlDir, 'resume.html'), { maxAge: maxAge });
});

notesHandler(app, appConfig.notes, environmentOpts.maxAge);

app.listen(3000);

console.log('Server started: http://localhost:3000/');
