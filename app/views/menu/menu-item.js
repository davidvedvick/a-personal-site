import pkg from 'react-hyperscript-helpers';
const { li, a, hh } = pkg;

export default hh((props) => li('.menu-item', [
	a({ href: props.menuItem.link }, props.menuItem.caption)
]));