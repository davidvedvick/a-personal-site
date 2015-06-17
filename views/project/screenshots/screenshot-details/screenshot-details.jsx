var React = require("react");
var path = require("path");
var Slider = require('react-slick');

var ScreenshotDetails = React.createClass({
    displayName: "ScreenshotDetails",
    render: function() {
        return (
            <div>
                <img src={this.props.url} className="screenshot-details" />
            </div>
        );
    }
});

module.exports = ScreenshotDetails;
