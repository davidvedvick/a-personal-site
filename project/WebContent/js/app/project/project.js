var React = require("react");

var Project = React.createClass({
	displayName: "Project",
	render: function() {
		return (
			<div className="project">
				<Title />
			</div>
		);
	}
});

module.exports = Project;
