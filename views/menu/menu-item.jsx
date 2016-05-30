import { li, a } from 'react-hyperscript-helpers';

const MenuItem = props => li('.menu-item', [
	a({ href: props.menuItem.link }, props.menuItem.caption)
]);

export default MenuItem;
