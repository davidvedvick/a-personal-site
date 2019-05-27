import { div, h1, h2, a, hh } from 'react-hyperscript-helpers';

var Header = hh((props) => div('.header', [
	h1([ a('.header-home-link', { href: '/', alt: 'Bio', title: 'Bio'}, 'David Vedvick')]),
	h2(props.subheader)
]));

module.exports = Header;
