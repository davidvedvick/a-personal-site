var React = require("react");

var Header = React.createClass({
	displayName: "Header",
	render: function() {
		return (
			<div className="header">
				<h1>Last Hope Software</h1>
				<h2>Software that KILLS YOU</h2>
			</div>
		);
	}
});

module.exports = Header;