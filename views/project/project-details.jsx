var React = require("react");
var ScreenshotList = require("./screenshots/screenshot-list");
var FeatureList = require("./features/feature-list");

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
});

var Logo = React.createClass({
	render: function() {
		return (<img className="headline-image" src={this.props.image ? this.props.image.url : "blah.jpg"} />);
	}
});

var ProjectDetails = React.createClass({
	displayName: "ProjectDetails",
	render: function() {
		var headerBackgroundStyle = {
			backgroundImage: [
				"url('/imgs/transparent-bg-pixel.png')",
				"url('" + this.props.project.headlineImage.url + "')"
			],
			backgroundRepeat: [
				"repeat",
				"no-repeat"
			]
		};
		return (
			<div className="project" style={headerBackgroundStyle}>
				<Title title={this.props.project.name} />
				<Description description={this.props.project.description} />
				<ScreenshotList images={this.props.project.images} />
				<FeatureList features={this.props.project.features} />
			</div>
		);
	}
});

module.exports = ProjectDetails;