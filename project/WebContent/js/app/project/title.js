var React = require("react");

var Title = React.createClass({
	render: function() {
		return (
			<div className="title">
				<h3>{this.props.author}</h3>
			</div>
		);
	}
});

module.exports = Title;