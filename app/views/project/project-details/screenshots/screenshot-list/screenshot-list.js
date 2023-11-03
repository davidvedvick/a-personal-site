import ScreenshotDetails from './../screenshot-details/screenshot-details.js';
import pkg from 'react-hyperscript-helpers';
const { div, hh } = pkg;

export default hh((props) => {
  const screenshotNodes = props.images.map(image => {
    return ScreenshotDetails({url: image.url});
  });

  return div('.screenshots-container', screenshotNodes);
});
