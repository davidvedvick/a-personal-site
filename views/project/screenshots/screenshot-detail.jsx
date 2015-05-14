var React = require("react");

var ScreenshotDetail = React.createClass({
        displayName: "ScreenshotDetail",
        render: function() {
	        return (
                <img src={this.props.url} />
	        );
        }
});

module.exports = ScreenshotDetail;
