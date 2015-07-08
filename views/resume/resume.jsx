var React = require("react");
var Layout = require("../layout");
var marked = require("marked");

var Resume = React.createClass({
	render: function() {
		return (
			<Layout subheader="Resume">
				<div className="resume">
					<a href="/resume.pdf" id="pdf-version"><img src="/imgs/file-pdf.svg" alt="View the PDF version!" /></a>
					<div className="resume-content" dangerouslySetInnerHTML={{__html: marked((this.props.resume || "").toString(), {sanitize: true})}} />
				</div>
			</Layout>
		);
	}
});

module.exports = Resume;
