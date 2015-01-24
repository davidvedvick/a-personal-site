var Project = React.createClass({
	displayName: "Project",
	render: function() {
		return dom.div(
			{ className: "project" },
			title()
		);
	}
});