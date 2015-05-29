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
if ('development' == app.get('env')) {
    var errorHandler = require('errorhandler');
    app.use(errorHandler());
}

app.use('/', function(req, res) {
    var projectData = JSON.parse(fs.readFileSync('projects/projects.json'));
    less.render(fs.readFileSync('views/index.less').toString())
        .then(function(output) {
            fs.writeFileSync('css/layout.css', output.css);
            res.render('index', { projects: projectData });
        },
        function(error) {
            console.log(error);
            res.render('index', { projects: projectData });
        });
});

app.listen(3000);

console.log('Server started: http://localhost:3000/');
