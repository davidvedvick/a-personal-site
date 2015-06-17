var React = require("react");
var ScreenshotDetails = require("./../screenshot-details/screenshot-details");
var path = require("path");

var ScreenshotList = React.createClass({
	displayName: "ScreenshotList",
	render: function() {
		const screenShotsContainer = "screenshots-container";
		const screenShotsContainerId = "#" + screenShotsContainer;

		var basePath = this.props.base;
		var screenshotNodes = this.props.images.map(function (image) {
			var imagePath = path.join(basePath, image.path || "");
			return (<ScreenshotDetails url={imagePath} />);
		});

		return (
			<div id={screenShotsContainer} className="screenshots-container">

				<div className="carousel-container">
					{screenshotNodes}
				</div>

				<a className="left carousel-control" href={screenShotsContainerId} role="button" data-slide="prev">
				    <span className="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
				    <span className="sr-only">Previous</span>
				</a>
				<a className="right carousel-control" href={screenShotsContainerId} role="button" data-slide="next">
					<span className="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
					<span className="sr-only">Next</span>
		  		</a>
			</div>
		);
	}
});

module.exports = ScreenshotList;
