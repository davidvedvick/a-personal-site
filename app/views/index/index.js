import pkg from 'react-hyperscript-helpers';
const {  div, img } = pkg;

import LayoutFactory from '../layout.js';
import { marked } from 'marked';

const Index = (props) => LayoutFactory([
	div('.bio', [
		img('.author-picture', { src: '/imgs/profile-picture.jpg' }),
		div('.bio-text', { dangerouslySetInnerHTML: { __html: marked((props.bio || '').toString(), { sanitize: true }) } })
	])
]);

export default Index;
