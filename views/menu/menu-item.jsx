import { li, a } from 'react-hyperscript-helpers';

var MenuItem = props => li('.menu-item', [
	a({ href: props.menuItem.link }, props.menuItem.caption)
]);

module.exports = MenuItem;
