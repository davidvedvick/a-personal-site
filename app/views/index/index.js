import { i, div, img, a } from 'react-hyperscript-helpers';
import LayoutFactory from '../layout';
import { marked } from 'marked';

const Index = (props) => LayoutFactory([
	div('.bio', [
		img('.author-picture', { src: '/imgs/profile-picture.jpg' }),
		div('.bio-text', { dangerouslySetInnerHTML: { __html: marked((props.bio || '').toString(), { sanitize: true }) } }),
		div('.social-links', [
			a('.linkedin', { href: 'https://www.linkedin.com/in/davidvedvick/' }, [ img({ src: '/imgs/linkedin.svg', title: 'LinkedIn', alt: 'LinkedIn' }) ]),
			a('.mastodon', { href: 'https://fosstodon.org/@davidvedvick', rel: 'me' }, [ img({ src: '/imgs/mastodon.svg', title: 'Mastodon', alt: 'Mastodon' }) ]),
		])
	])
]);

export default Index;
