var React = require("react");

var ScreenshotDetails = React.createClass({
        displayName: "ScreenshotDetails",
        render: function() {
            var itemClassName = "item"
            if (this.props.isActive)
                itemClassName += " active";

	        return (
                <div className="carousel-inner">
                    <div className={itemClassName}>
                        <img src={this.props.url} className="screenshot-details" />
                    </div>
                </div>
	        );
        }
});

module.exports = ScreenshotDetails;
