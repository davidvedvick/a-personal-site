var React = require("react");
var Layout = require("../layout");
var marked = require("marked");

var Resume = React.createClass({
	render: function() {
		return (
			<Layout subheader="Resume">
				<div className="content" dangerouslySetInnerHTML={{__html: marked((this.props.resume || "").toString(), {sanitize: true})}} />
			</Layout>
		);
	}
});

module.exports = Resume;
