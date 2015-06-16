var React = require("react");
var ScreenshotDetails = require("./../screenshot-details/screenshot-details");

const screenShotsContainer = "screenshots-container";
const screenShotsContainerId = "#" + screenShotsContainer;

var ScreenshotList = React.createClass({
	displayName: "ScreenshotList",
	render: function() {
		var screenshotNodes = this.props.images.map(function (image, index) {
			var isActive = index == 0;
			return (<ScreenshotDetails url={image.url} isActive={isActive} />);
		});

		var indicatorNodes = this.props.images.map(function (image, index) {
			var isActiveClassName = index == 0 ? "active" : "";
			return (<li data-target={screenShotsContainerId} data-slide-to={index} className={isActiveClassName} />);
		});

		return (
			<div id={screenShotsContainer} className="screenshots-container carousel slide">
				<ol className="carousel-indicators">
					{indicatorNodes}
				</ol>

				<div className="carousel-inner" role="listbox">
					{screenshotNodes}
				</div>
				<a className="left carousel-control" href={screenShotsContainerId} role="button" data-slide="prev">
				    <span className="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
				    <span className="sr-only">Previous</span>
				</a>
				<a className="right carousel-control" href={screenShotsContainerId} role="button" data-slide="next">
					<span className="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
					<span className="sr-only">Next</span>
		  		</a>
			</div>
		);
	}
});

if (!process.version) {
	try {
		// pollute the global namespace with jquery just coz I love it so much
		global.jQuery = require("jquery");
		var bootstrap = require("bootstrap");

		(function($) {
			$(screenShotsContainerId).carousel();
		})(jQuery);
	} catch (e) {
		console.log(e);
	}
}

module.exports = ScreenshotList;
