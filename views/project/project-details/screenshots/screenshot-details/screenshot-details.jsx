import { div, img } from 'react-hyperscript-helpers';

var ScreenshotDetails = (props) => div('.screenshot-details-container', [ img('.screenshot-details', { src: props.url }) ]);

export default ScreenshotDetails;
