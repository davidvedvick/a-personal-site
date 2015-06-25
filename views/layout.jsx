var React = require("react");
var Menu = require("./menu/menu");
var Header = require("./header");
// var $ = require("jquery");

var Layout = React.createClass({
	displayName: "Layout",
	render: function() {
		var subheader = this.props.subheader || "It's been coded";
		return (
			<html className="no-js">
			<head>
				<meta httpEquiv="Content-Type" content="text/html; charset=ISO-8859-1" />
				<link href="/css/layout.css" type="text/css" rel="stylesheet" />
				<title>David Vedvick ({subheader})</title>
			</head>
			<body>
				<div className="layout">
					<Header subheader={subheader} />
					<Menu />
					{this.props.children}
				</div>
			</body>
			</html>
		);
	}
});

module.exports = Layout;
