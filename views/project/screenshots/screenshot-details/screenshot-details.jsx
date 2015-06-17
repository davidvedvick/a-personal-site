var React = require("react");
var path = require("path");

var ScreenshotDetails = React.createClass({
    displayName: "ScreenshotDetails",
    render: function() {
        return (
            <div className="screenshot-container">
                <img src={this.props.url} className="screenshot-details" />
            </div>
        );
    }
});

module.exports = ScreenshotDetails;
