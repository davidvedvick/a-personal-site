var React = require("react");
var ScreenshotDetails = require("./../screenshot-details/screenshot-details");
var path = require("path");

var ScreenshotList = React.createClass({
	displayName: "ScreenshotList",
	render: function() {
		const screenShotsContainer = "screenshots-container";
		const screenShotsContainerId = "#" + screenShotsContainer;

		var basePath = this.props.base;
		var screenshotNodes = this.props.images.map(function (image) {
			var imagePath = path.join(basePath, image.path || "");
			return (<ScreenshotDetails url={imagePath} />);
		});

		var sliderSettings = {
	      dots: true,
	      infinite: true,
	      speed: 500,
	      slidesToShow: 1,
	      slidesToScroll: 1
	    };

		return (
			<div className="screenshots-container">
				{screenshotNodes}
			</div>
		);
	}
});

if (process.browser) {
	(function ($) {
		$(function() {
			var slick = require("slick-carousel");

			$(".screenshots-container").slick({
				dots: true,
				infinite: true,
				speed: 1000,
				slidesToShow: 1,
				slidesToScroll: 1,
				// fade: true,
				// autoplay: true,
				// autoplaySpeed: 6000,
				// cssEase: 'linear'
			});
		});
	})(require("jquery"));
}

module.exports = ScreenshotList;
