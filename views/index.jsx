var React = require("react");
var Header = require("./header");
var ProjectDetails = require("./project/project-details");
var Layout = require("./layout");

var Index = React.createClass({
	render: function() {
		var projectNodes = this.props.projects.map(function (project) {
			return (<ProjectDetails project={project} />);
		});

		return (
			<Layout>
				<div className="layout">
					<Header />
					{projectNodes}
				</div>
			</Layout>
		);
	}
});

module.exports = Index;
