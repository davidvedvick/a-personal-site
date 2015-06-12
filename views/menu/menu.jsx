var React = require("react");
var MenuItem = require("./menu-item");

var Menu = React.createClass({
	displayName: "Menu",
	render: function() {
		var menuNodes = [
			{
				"caption": "Home",
				"link": "/"
			},
			{
				"link": "/blog",
				"caption": "Blog"
			},
			{
				"link": "/resume",
				"caption": "Curriculum Vitae"
			}
		].map(function(menuItem) {
			return (<MenuItem menuItem={menuItem} />);
		});

		return (<ul className="menu-list">{menuNodes}</ul>);
	}
});

module.exports = Menu;
