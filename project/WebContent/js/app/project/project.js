var React = require("react");

var Project = React.createClass({
	displayName: "Project",
	render: function() {
		return (
			<div className="project">
				<Title title="{this.project.name}" />
			</div>
		);
	}
});

module.exports = Project;
