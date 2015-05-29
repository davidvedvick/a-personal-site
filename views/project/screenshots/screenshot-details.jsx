var React = require("react");

var ScreenshotDetails = React.createClass({
        displayName: "ScreenshotDetails",
        render: function() {
	        return (
                <img src={this.props.url} className="screenshot-details" />
	        );
        }
});

module.exports = ScreenshotDetails;
