var React = require('react');
var Layout = require('../layout');
var NotesList = require('./notes-list');

var NotesContainer = React.createClass({
	render: function() {
		return (
			<Layout subheader="Notes">
				<NotesList notes={this.props.notes} />

				<script type="text/javascript" src="/js/notes.client.js" />
			</Layout>
		);
	}
});

module.exports = NotesContainer;
