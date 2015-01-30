var Header = require("./header.js");
var Project = require("./project/project.js");

var Layout = React.createClass({
	displayName: "Layout",
	render: function() {
		return (
			<div className="layout">
				<Header />
			</div>
		);
	}
});

module.exports = Layout;
