var React = require('react');
var Layout = require('../layout');
var marked = require('marked');

var Index = React.createClass({
	render: function() {
		return (
			<Layout>
				<div className="resume" dangerouslySetInnerHTML={{__html: marked((this.props.bio || "").toString(), {sanitize: true})}} />
			</Layout>
		);
	}
});

module.exports = Index;
