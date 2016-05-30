import ScreenshotDetails from './../screenshot-details/screenshot-details';
import path from 'path';
import { div, hh } from 'react-hyperscript-helpers';

var ScreenshotList = hh((props) => {
	const basePath = props.base;
	const screenshotNodes = props.images.map(image => {
		const imagePath = path.join(basePath, image.path || '');
		return ScreenshotDetails({url: imagePath});
	});

	return div('.screenshots-container', screenshotNodes);
});

module.exports = ScreenshotList;
