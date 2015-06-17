var React = require("react");
var ProjectDetails = require("./project-details/project-details");
var Layout = require("../layout");

var Index = React.createClass({
	render: function() {
		var projectNodes = this.props.projects.map(function (project) {
			return (<ProjectDetails project={project} />);
		});

		return (
			<Layout>
				{projectNodes}
			</Layout>
		);
	}
});

module.exports = Index;
