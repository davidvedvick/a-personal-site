var React = require("react");
var Screenshot = require("./screenshot.js");

var Screenshots = React.createClass({
	displayName: "Screenshots",
	render: function() {
		var screenshotNodes = this.props.images.map(function (image) {
			return (<Screenshot url={image.url} />);
		});

		return (
			<div className="screenshots">
				{screenshotNodes}
			</div>
		);
	}
});

module.exports = Screenshots;
