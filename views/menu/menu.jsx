var React = require("react");
var MenuItem = require("./menu-item");

var Menu = React.createClass({
	displayName: "Menu",
	render: function() {
		var menuNodes = [
			{
				"caption": "Projects",
				"link": "/"
			},
			{
				"link": "/notes",
				"caption": "Notes"
			},
			{
				"link": "/resume",
				"caption": "Resume"
			}
		].map(function(menuItem) {
			return (<MenuItem menuItem={menuItem} />);
		});

		return (<ul className="menu-list">{menuNodes}</ul>);
	}
});

module.exports = Menu;
