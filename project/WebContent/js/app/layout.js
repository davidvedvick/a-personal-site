var React = require("react");
var Header = require("./header.js");
var Project = require("./project/project.js");

var Layout = React.createClass({
	displayName: "Layout",
	render: function() {
		var projectNodes = this.props.projects.map(function (url) {
			return (<Project url={url} />);
		});
			
		return (
			<div className="layout">
				<Header />
				{projectNodes}
			</div>
		);
	}
});

module.exports = Layout;
