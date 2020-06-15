import ScreenshotDetails from './../screenshot-details/screenshot-details';
import path from 'path';
import { div, hh } from 'react-hyperscript-helpers';

var ScreenshotList = hh((props) => {
	const screenshotNodes = props.images.map(image => {
		return ScreenshotDetails({url: image.url});
	});

	return div('.screenshots-container', screenshotNodes);
});

module.exports = ScreenshotList;
