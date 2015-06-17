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
