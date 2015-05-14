var React = require("react");
var ScreenshotDetail = require("./screenshot-detail");

var ScreenshotList = React.createClass({
	displayName: "ScreenshotList",
	render: function() {
		var screenshotNodes = this.props.images.map(function (image) {
			return (<ScreenshotDetail url={image.url} />);
		});

		return (
			<div className="screenshots">
				{screenshotNodes}
			</div>
		);
	}
});

module.exports = ScreenshotList;
