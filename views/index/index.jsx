var React = require('react');
var Layout = require('../layout');
var marked = require('marked');

var Index = React.createClass({
	render: function () {
		return (
			<Layout>
				<div className="bio">
					<img className="author-picture" src="/imgs/profile-picture.jpg" />
					<div className="bio-text" dangerouslySetInnerHTML={{__html: marked((this.props.bio || '').toString(), {sanitize: true})}} />
				</div>
			</Layout>
		);
	}
});

module.exports = Index;
