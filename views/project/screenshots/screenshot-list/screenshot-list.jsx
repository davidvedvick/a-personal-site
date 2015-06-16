var React = require("react");
var ScreenshotDetails = require("./../screenshot-details/screenshot-details");

var ScreenshotList = React.createClass({
	displayName: "ScreenshotList",
	render: function() {
		var screenshotNodes = this.props.images.map(function (image, index) {
			var isActive = index == 0;
			return (<ScreenshotDetails url={image.url} isActive={isActive} />);
		});

		var indicatorNodes = this.props.images.map(function (image, index) {
			var isActiveClassName = index == 0 ? "active" : "";
			return (<li data-target="#screenshots-container" data-slide-to={index} className={isActiveClassName} />);
		});

		return (
			<div id="screenshots-container" className="screenshots-container carousel slide">
				<ol className="carousel-indicators">
					{indicatorNodes}
				</ol>

				<div className="carousel-inner" role="listbox">
					{screenshotNodes}
				</div>
				<a className="left carousel-control" href="#carousel-example-generic" role="button" data-slide="prev">
				    <span className="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
				    <span className="sr-only">Previous</span>
				</a>
				<a className="right carousel-control" href="#carousel-example-generic" role="button" data-slide="next">
					<span className="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
					<span className="sr-only">Next</span>
		  		</a>
			</div>
		);
	}
});

if (!process.version) {
	try {
		global.jQuery = require("jquery");
		var bootstrap = require("bootstrap");
		jQuery(function() {
			jQuery("#screenshots-container").carousel();
		});
	} catch (e) {
		console.log(e);
	}
}

module.exports = ScreenshotList;
