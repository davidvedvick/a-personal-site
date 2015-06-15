var React = require("react");
var ScreenshotDetails = require("./../screenshot-details/screenshot-details");

var ScreenshotList = React.createClass({
	displayName: "ScreenshotList",
	render: function() {
		var screenshotNodes = this.props.images.map(function (image) {
			return (<ScreenshotDetails url={image.url} />);
		});

		return (
			<div className="screenshots-container">
				<div className="prev-screenshot nav-section">
					<img src="./imgs/chevron_left.png" />
				</div>
				<div className="nav-section screenshots">
					{screenshotNodes}
				</div>
				<div className="next-screenshot nav-section">
					<img src="./imgs/chevron_right.png" />
				</div>
			</div>
		);
	}
});

module.exports = ScreenshotList;
