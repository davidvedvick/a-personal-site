import ScreenshotDetails from './../screenshot-details/screenshot-details';
import { div, hh } from 'react-hyperscript-helpers';

const ScreenshotList = hh((props) => {
  const screenshotNodes = props.images.map(image => {
    return ScreenshotDetails({url: image.url});
  });

  return div('.screenshots-container', screenshotNodes);
});

module.exports = ScreenshotList;
