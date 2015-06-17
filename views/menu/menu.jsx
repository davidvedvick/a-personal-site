var React = require("react");
var MenuItem = require("./menu-item");

var Menu = React.createClass({
	displayName: "Menu",
	render: function() {
		var menuNodes = [
			{
				"link": "/projects",
				"caption": "Side Projects"
			},
			{
				"link": "/resume",
				"caption": "Resume"
			},
			{
				"link": "/notes",
				"caption": "Notes"
			}
		].map(function(menuItem) {
			return (<MenuItem menuItem={menuItem} />);
		});

		return (<ul className="menu-list">{menuNodes}</ul>);
	}
});

module.exports = Menu;
