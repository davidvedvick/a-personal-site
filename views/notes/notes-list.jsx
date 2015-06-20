var React = require('react');
var Note = require('./note/note');
var Layout = require('../layout');

var NotesList = React.createClass({
	render: function() {
		// notes objects should look like "{title, date, text}". don't include private
		// ones

		var noteNodes = (this.props.notes || []).map(function(note) {
			return (<Note note={note} />);
		});

		return (
			<Layout subheader="Notes">
				{noteNodes}
			</Layout>
		);
	}
});

module.exports = NotesList;
