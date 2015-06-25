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
	loadMoreNotesIfNecessary: function() {
		if (jQuery(window).scrollTop() >= jQuery('div.note:nth-last-child(5)').offset().top)
			this.getNotes();
	},
	getNotes: function() {
		jQuery(window).off('scroll', this.loadMoreNotesIfNecessary);

	 	jQuery.ajax({
			url: '/notes/' + (++this.page),
			dataType: 'json',
			cache: false,
			success: function(data) {
				if (data.length == 0) return;

				this.setState({notes: this.state.notes.concat(data)});
				jQuery(window).on('scroll', this.loadMoreNotesIfNecessary);
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(err.toString());
				jQuery(window).on('scroll', this.loadMoreNotesIfNecessary);
			}.bind(this)
		});
	},
	componentDidMount: function() {
		var reactObject = this;
		(function($) {
			$(function() {
				$(window).on('scroll', reactObject.loadMoreNotesIfNecessary);
				reactObject.loadMoreNotesIfNecessary();
			});
		})(jQuery);
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
			</div>
		);
	}
});

module.exports = NotesList;
