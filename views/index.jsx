var React = require("react");
var Header = require("./header");
var Project = require("./project/project");
var Layout = require("./layout");

var Index = React.createClass({
	render: function() {
		var projectNodes = this.props.projects.map(function (project) {
			return (<Project project={project} />);
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
