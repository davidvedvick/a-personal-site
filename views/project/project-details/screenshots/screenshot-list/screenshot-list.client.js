(($) => {
	$(() => {
		require('slick-carousel');

		$('.screenshots-container').slick({
			dots: true,
			infinite: true,
			speed: 1000,
			slidesToShow: 1,
			slidesToScroll: 1
		});
	});
})(require('jquery'));
