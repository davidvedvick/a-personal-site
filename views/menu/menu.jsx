import { ul } from 'react-hyperscript-helpers';
var MenuItem = require('./menu-item');

var Menu = () => {
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
	].map(menuItem => MenuItem({ menuItem: menuItem }));

	return ul('.menu-list', menuNodes);
};

module.exports = Menu;
