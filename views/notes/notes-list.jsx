var React = require('react');
var Note = require('./note/note');
var jQuery = require('jquery');

var NotesList = React.createClass({
	page: 1,
	getInitialState: function() {
		return {
			notes: this.props.notes || []
		};
	},
	onMoreNotesClick: function(e) {
		e.preventDefault();
		console.log(this.page);
		jQuery.ajax({
			url: '/notes/' + (++this.page),
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({notes: this.state.notes.concat(data)});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	render: function() {
		// notes objects should look like "{title, date, text}". don't include private
		// ones
		var noteNodes = (this.state.notes || []).map(function(note) {
			return (<Note note={note} />);
		});

		return (
			<div id="notes-container">
				{noteNodes}
				<a href="#more" id="more-notes" onClick={this.onMoreNotesClick}>More!</a>
			</div>
		);
	}
});

module.exports = NotesList;
