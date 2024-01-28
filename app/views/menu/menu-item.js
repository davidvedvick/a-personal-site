import pkg from 'react-hyperscript-helpers';
const { li, a, hh } = pkg;

export default hh((props) => li({ key: props.menuItem.link, className: 'menu-item' }, [
	a({ href: props.menuItem.link }, props.menuItem.caption),
]));