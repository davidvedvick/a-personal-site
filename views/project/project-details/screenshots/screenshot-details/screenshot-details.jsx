import { div, img, hh } from 'react-hyperscript-helpers';

var ScreenshotDetails = hh((props) => div('.screenshot-details-container', [ img('.screenshot-details', { src: props.url }) ]));

export default ScreenshotDetails;
