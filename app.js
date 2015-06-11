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

    // set filename so that relative imports are handled
    fs.readFile('views/index.less', function(error, data) {
        if (error) {
            console.log(error);
            return;
        }

        less.render(data.toString(), { filename: 'views/index.less'})
            .then(function(lessOutput) {
                fs.readFile('projects/projects.json', function(error, rawProjectData) {
                    if (error) {
                        console.log(error);
                        return;
                    }

                    fs.writeFile('./css/layout.css', lessOutput.css, function(error) {
                        try {
                            res.render('index', { projects: JSON.parse(rawProjectData) });
                        } catch (exception) {
                            console.log(exception);
                        }
                    });
                });
            },
            function(error) {
                console.log(error);
            });
    });
});

app.listen(3000);

console.log('Server started: http://localhost:3000/');
