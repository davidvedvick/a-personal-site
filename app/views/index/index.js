import pkg from 'react-hyperscript-helpers';
const {  div, img } = pkg;

import LayoutFactory from '../layout.js';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const Index = (props) => LayoutFactory([
	div('.bio', [
		img('.author-picture', { src: '/imgs/profile-picture.jpg' }),
		div('.bio-text', { dangerouslySetInnerHTML: { __html: sanitizeHtml(marked((props.bio || '').toString())) } })
	])
]);

export default Index;
