var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var favIcon = require('serve-favicon');
var methodOverride = require('method-override');
var less = require('less');

var app = express();
app.use('/', express.static(__dirname));
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

app.use('/', function(req, res) {
    fs.readFile('projects/projects.json', function(error, rawProjectData) {
        if (error) {
            console.log(error);
            return;
        }

        try {
            res.render('index', { projects: JSON.parse(rawProjectData) });
        } catch (exception) {
            console.log(exception);
        }
    });
});

app.listen(3000);

console.log('Server started: http://localhost:3000/');
