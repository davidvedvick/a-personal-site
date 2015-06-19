var React = require("react");
var marked = require("marked");
var Features = require("./features/features");
var ScreenshotList = require("./screenshots/screenshot-list/screenshot-list");
var path = require("path");

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

var ProjectDetails = React.createClass({
	displayName: "ProjectDetails",
	render: function() {
		var baseImgPath = path.join("/", "imgs", "projects",  this.props.project.name, "imgs");

		var headerBackgroundStyle = {
			backgroundImage: [
				"url('/imgs/transparent-bg-pixel.png')",
				"url('" + path.join(baseImgPath, this.props.project.headlineImage.path || "") + "')"
			],
			backgroundRepeat: [
				"repeat",
				"no-repeat"
			]
		};

		return (
			<div className="project" style={headerBackgroundStyle}>
				<Title title={this.props.project.prettyName || this.props.project.name} />
				<Description description={this.props.project.description} />
				<div className="project-details-container">
					<Features features={this.props.project.features} />
					<ScreenshotList images={this.props.project.images} base={baseImgPath} />
				</div>
			</div>
		);
	}
});

module.exports = ProjectDetails;
