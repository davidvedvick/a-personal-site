import { li, a, hh } from 'react-hyperscript-helpers';

const MenuItem = hh((props) => li('.menu-item', [
	a({ href: props.menuItem.link }, props.menuItem.caption)
]));

export default MenuItem;
