var React = require("react");
var ScreenshotDetails = require("./../screenshot-details/screenshot-details");

var ScreenshotList = React.createClass({
	displayName: "ScreenshotList",
	render: function() {
		var screenshotNodes = this.props.images.map(function (image) {
			return (<ScreenshotDetails url={image.url} />);
		});

		return (
			<div className="screenshots">
				<div className="prev-screenshot nav-buttons">

				</div>
				{screenshotNodes}
				<div className="prev-screenshot nav-buttons">

				</div>
			</div>
		);
	}
});

module.exports = ScreenshotList;
