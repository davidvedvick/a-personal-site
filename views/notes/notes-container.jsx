var React = require('react');
var Layout = require('../layout');
var NotesList = require('./notes-list');

var NotesContainer = React.createClass({
	render: function() {
		return (
			<Layout subheader="Notes">
				<NotesList notes={this.props.notes} />

				<a href="#more" id="more-notes">More!</a>
				<script type="text/javascript" src="/notes.client.js" />
			</Layout>
		);
	}
});

module.exports = NotesContainer;
