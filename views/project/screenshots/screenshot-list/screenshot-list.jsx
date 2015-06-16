var React = require("react");
var ScreenshotDetails = require("./../screenshot-details/screenshot-details");
var jQueryFactory = require("jquery");
var bootstrap = null, jQuery = null;

try {
	jQuery = jQueryFactory();
	bootstrap = require("bootstrap");
} catch (e) {
	console.log(e);
}

var ScreenshotList = React.createClass({
	displayName: "ScreenshotList",
	render: function() {
		var screenshotNodes = this.props.images.map(function (image) {
			return (<ScreenshotDetails url={image.url} />);
		});

		return (
			<div className="screenshots-container">{screenshotNodes}</div>
		);
	}
});

module.exports = ScreenshotList;
