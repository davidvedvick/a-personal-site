var React = require("react");

var ScreenshotDetails = React.createClass({
        displayName: "ScreenshotDetails",
        render: function() {
	        return (
                <img src={this.props.url} />
	        );
        }
});

module.exports = ScreenshotDetails;
