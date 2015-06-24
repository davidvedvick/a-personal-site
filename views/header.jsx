var React = require("react");

var Header = React.createClass({
	displayName: "Header",
	render: function() {
		return (
			<div className="header">
				<h1><a href="/" alt="Bio" title="Bio" className="header-home-link">David Vedvick</a></h1>
				<h2>{this.props.subheader}</h2>
			</div>
		);
	}
});

module.exports = Header;
