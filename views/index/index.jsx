import { div, img } from 'react-hyperscript-helpers';
import Layout from '../layout';
import marked from 'marked';

var Index = props => Layout([
	div('.bio', [
		img('.author-picture', { src: '/imgs/profile-picture.jpg' }),
		div('.bio-text', { dangerouslySetInnerHTML: { __html: marked((props.bio || '').toString(), { sanitize: true }) } })
	])
]);

export default Index;
