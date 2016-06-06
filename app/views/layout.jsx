import { html, head, meta, link, title, body, div, hh } from 'react-hyperscript-helpers';

import Menu from './menu/menu';
import Header from './header';

const Layout = (props) => {
	const subheader = props.subheader || "It's been coded";
	const header = 'David Vedvick (' + subheader + ')';

	return html('.no-js', [
			head([
				meta({httpEquiv: 'Content-Type', content: 'text/html; charset=ISO-8859-1'}),
				meta({httpEquiv: 'X-UA-Compatible', content: 'IE=Edge'}),
				meta({httpEquiv: 'viewport', content: 'width=device-width, initial-scale=1'}),
				link({href: '/css/layout.css', type: 'text/css', rel: 'stylesheet'}),
				title(header)
			]),
			body([
				div('.top', [ Header({subheader: subheader}), Menu() ]),
				div('.content', Array.isArray(props.children) ? props.children : [ props.children ])
			])
		]);
};

const LayoutFactory = hh(Layout);

export default LayoutFactory;
