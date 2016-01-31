var React = require('react');
var Menu = require('./menu/menu');
var Header = require('./header');

var Layout = (props) => {
	const subheader = props.subheader || "It's been coded";
	const header = 'David Vedvick (' + subheader + ')';
	return (
		<html className="no-js">
		<head>
			<meta httpEquiv="Content-Type" content="text/html; charset=ISO-8859-1" />
			<meta httpEquiv="X-UA-Compatible" content="IE=Edge" />
			<link href="/css/layout.css" type="text/css" rel="stylesheet" />
			<title>{header}</title>
		</head>
		<body>
			<div className="top">
				<Header subheader={subheader} />
				<Menu />
			</div>
			<div className="content">
				{props.children}
			</div>
		</body>
		</html>
	);
};

module.exports = Layout;
