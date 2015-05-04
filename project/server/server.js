var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//var comments = JSON.parse(fs.readFileSync('_comments.json'));

app.use('/', express.static(path.join(__dirname, '../WebContent')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/comments.json', function(req, res) {
//  res.setHeader('Content-Type', 'application/json');
//  res.send(JSON.stringify(comments));
//});
//
//app.post('/comments.json', function(req, res) {
//  comments.push(req.body);
//  fs.writeFile('_comments.json', JSON.stringify(comments))
//  res.setHeader('Content-Type', 'application/json');
//  res.send(JSON.stringify(comments));
//});


// let routes = require('../src/routes');
// let bootstrap = require('../src/bootstrap');
//
// app.get('*', function (req, res, next) {
//
//   go(function*() {
//     let payload = {
//       user: { name: req.session.username,
//               admin: isAdmin(req.session.username) },
//       config: {
//         url: nconf.get('url')
//       }
//     };
//     let title = 'Last Hope Software';
//     let bodyClass = '';
//     let content = 'Loading...';
//
// 	let { router, pageChan } = bootstrap.run(
// 		routes,
// 		req.path,
// 		{ user: payload.user }
// 	);
//
// 	let { Handler, props } = yield take(pageChan);
//
// 	payload.data = props.data;
//
// 	if(process.env.NODE_ENV !== 'production' && props.error) {
// 		res.send(props.error.stack);
// 		throw props.error;
// 	}
//
// 	if(props.title) {
// 		title = typeof props.title === 'function' ?
// 		props.title(props.data) :
// 		props.title;
// 	}
// 	if(props.bodyClass) {
// 		bodyClass = props.bodyClass;
// 	}
//
// 	content = React.renderToString(React.createElement(Handler, props))
//
//     let result = appTemplate({
//       content: content,
//       payload: encodeTextContent(JSON.stringify(payload)),
//       bodyClass: bodyClass,
//       title: title,
//       webpackURL: nconf.get('webpackURL')
//     });
//
//     res.send(result);
//   });
// });


app.listen(3000);

console.log('Server started: http://localhost:3000/');
