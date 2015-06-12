var React = require("react");
var MenuItem = require("./menu-item");

var Menu = React.createClass({
	displayName: "Menu",
	render: function() {
		var menuItems = [
			{
				"caption": "Home",
				"link": "/"
			},
			{
				"link": "/blog",
				"caption": "Blog"
			},
		]

		var menuNodes = menuItems.map(function(menuItem) {
			return (<MenuItem menuItem={menuItem} />);
		});

		return (<ul>{menuNodes}</ul>);
	}
});

module.exports = Menu;
