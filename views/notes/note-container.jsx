var React = require('react');
var Layout = require('../layout');
var Note = require('./note/note');

var NotesContainer = React.createClass({
	render: function () {
		return (
			<Layout subheader="Notes">
				<Note note={this.props.note} />
			</Layout>
		);
	}
});

module.exports = NotesContainer;
