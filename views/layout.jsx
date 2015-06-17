var React = require("react");
var Menu = require("./menu/menu");
var Header = require("./header");
// var $ = require("jquery");

var Layout = React.createClass({
	displayName: "Layout",
	render: function() {
		return (
			<html>
			<head>
				<meta httpEquiv="Content-Type" content="text/html; charset=ISO-8859-1" />
				<link href="/libs/slick-carousel/slick/slick-theme.css" type="text/css" rel="stylesheet" />
				<link href="/css/index.css" type="text/css" rel="stylesheet" />
				<script type="text/javascript" src="/js/client.js" />
				<title>David Vedvick (It's been coded)</title>
			</head>
			<body>
				<div className="layout">
					<Header />
					<Menu />
					{this.props.children}
				</div>
			</body>
			</html>
		);
	}

	//<link href="/libs/slick-carousel/slick/slick.css" type="text/css" rel="stylesheet" />
});

module.exports = Layout;
