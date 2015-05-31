var React = require("react");
// var $ = require("jquery");

var Layout = React.createClass({
	displayName: "Layout",
	render: function() {
		return (
			<html>
			<head>
				<meta httpEquiv="Content-Type" content="text/html; charset=ISO-8859-1" />
				<style type="text/css">
					{{__html: this.props.style}}
				</style>
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
