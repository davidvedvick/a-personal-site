import pkg from 'react-hyperscript-helpers';
const { div, img, hh } = pkg;

const ScreenshotDetails = hh((props) => div('.screenshot-details-container', [ img('.screenshot-details', { src: props.url }) ]));

export default ScreenshotDetails;
