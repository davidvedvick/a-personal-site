var React = require("react");
var Screenshots = require("./screenshots");

var Title = React.createClass({
	render: function() {
		return (
			<h2 className="title">{this.props.title}</h2>
		);
	}
});

var Description = React.createClass({
	render: function() {
		return (
			<h3 className="description">{this.props.description}</h3>
		)
	}
})

var Project = React.createClass({
	displayName: "Project",
	render: function() {
		return (
			<div className="project">
				<Title title={this.props.project.name} />
				<Description description={this.props.project.description} />
				<Screenshots images={this.props.project.images} />
			</div>
		);
	}
});

module.exports = Project;
