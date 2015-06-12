var React = require("react");

var MenuItem = React.createClass({
	displayName: "MenuItem",
	render: function() {
		return (
			<li className="menu-item">
				<a href={this.props.menuItem.link}>
					{this.props.menuItem.caption}
				</a>
			</li>
		);
	}
});

module.exports = MenuItem;
