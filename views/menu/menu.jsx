import { ul, hh } from 'react-hyperscript-helpers';
var MenuItem = require('./menu-item');

var Menu = hh(() => {
	var menuNodes = [
		{
			'link': '/projects',
			'caption': 'Side Projects'
		},
		{
			'link': '/resume',
			'caption': 'Resume'
		},
		{
			'link': '/notes',
			'caption': 'Notes'
		}
	].map(menuNode => MenuItem({ menuItem: menuNode }));

	return ul('.menu-list', menuNodes);
});

export default Menu;
