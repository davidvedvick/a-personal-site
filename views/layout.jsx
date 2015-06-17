var React = require("react");
// var $ = require("jquery");

var Layout = React.createClass({
	displayName: "Layout",
	render: function() {
		return (
			<html>
			<head>
				<meta httpEquiv="Content-Type" content="text/html; charset=ISO-8859-1" />
				<link href="/css/index.css" type="text/css" rel="stylesheet" />
				<link href="/node_modules/bootstrap/dist/css/bootstrap.min.css" type="text/css" rel="stylesheet" />
				<script type="text/javascript" src="/js/client.js" />
				<title>Last Hope Software - Your Last Hope for Quality Software</title>
			</head>
			<body>
				{this.props.children}
			</body>
			</html>
		);
	}
});

module.exports = Layout;
