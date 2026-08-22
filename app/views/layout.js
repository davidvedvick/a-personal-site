import pkg from 'react-hyperscript-helpers';
const { html, head, meta, link, title, body, div, hh, footer, a, img } = pkg;

import Menu from './menu/menu.js';
import Header from './header.js';

const Layout = (props) => {
	const subheader = props.subheader || "It's been coded";
	let header = `David Vedvick (${subheader})`;
  const context = props.context;
  if (context)
    header += ` - ${context}`;

	return html('.no-js', [
			head([
				meta({httpEquiv: 'Content-Type', content: 'text/html; charset=ISO-8859-1'}),
				meta({httpEquiv: 'X-UA-Compatible', content: 'IE=Edge'}),
				meta({name: 'viewport', content: 'width=device-width, initial-scale=1'}),
				link({href: '/css/layout.css', type: 'text/css', rel: 'stylesheet'}),
				title(header)
			]),
			body([
				div('.top', [ Header({subheader: subheader}), Menu() ]),
				div('.content', Array.isArray(props.children) ? props.children : [ props.children ]),
				footer([
					div('.social-links', [
						a('.linkedin', { href: 'https://www.linkedin.com/in/davidvedvick/' }, [ img({ src: '/imgs/linkedin.svg', title: 'LinkedIn', alt: 'LinkedIn' }) ]),
						a('.mastodon', { href: 'https://fosstodon.org/@davidvedvick', rel: 'me' }, [ img({ src: '/imgs/mastodon.svg', title: 'Mastodon', alt: 'Mastodon' }) ]),
					])
				])
			])
		]);
};

const LayoutFactory = hh(Layout);

export default LayoutFactory;
