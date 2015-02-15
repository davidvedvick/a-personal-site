var React = require("react");
require("screenshot.js")

var Screenshots = React.createClass({
	displayName: "Screenshots",
	render: function() {
		var screenshotNodes = this.props.screenshotUrls.map(function (url) {
			return (<Screenshot url={url} />);
		});

		return (
			<div className="screenshots">
				{screenshotNodes}
			</div>
		);
	}
});

Module.exports = Screenshots;