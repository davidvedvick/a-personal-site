import ScreenshotDetails from './../screenshot-details/screenshot-details';
import path from 'path';
import { div } from 'react-hyperscript-helpers';

var ScreenshotList = props => {
	var basePath = props.base;
	var screenshotNodes = props.images.map(function (image) {
		var imagePath = path.join(basePath, image.path || '');
		return ScreenshotDetails({url: imagePath});
	});

	return div('.screenshots-container', screenshotNodes);
};

module.exports = ScreenshotList;
