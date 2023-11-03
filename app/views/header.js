import pkg from 'react-hyperscript-helpers';
const { div, h1, h2, a, hh } = pkg;

export default hh((props) => div('.header', [
	h1([ a('.header-home-link', { href: '/', alt: 'Bio', title: 'Bio'}, 'David Vedvick')]),
	h2(props.subheader)
]));
