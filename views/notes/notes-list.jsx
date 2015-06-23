var React = require('react');
var Note = require('./note/note');
var jQuery = require('jquery');

var NotesList = React.createClass({
	page: 1,
	isLoading: false,
	getInitialState: function() {
		return {
			notes: this.props.notes || []
		};
	},
	getNotes: function() {
		if (this.isLoading) return;

		this.isLoading = true;
	 	jQuery.ajax({
			url: '/notes/' + (++this.page),
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({notes: this.state.notes.concat(data)});
				this.isLoading = false;
			}.bind(this),
			error: function(xhr, status, err) {
				this.isLoading = false;
				console.error(err.toString());
			}.bind(this)
		});
	},
	componentDidMount: function() {
		var reactObject = this;
		(function($) {
			$(function() {
				$(window).scroll(function(event) {
					if ($(window).scrollTop() < $('div.note:nth-last-child(5)').offset().top) return;

					reactObject.getNotes();
				});
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
