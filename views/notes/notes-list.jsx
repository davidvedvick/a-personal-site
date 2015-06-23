var React = require('react');
var Note = require('./note/note');
var jQuery = require('jquery');

var NotesList = React.createClass({
	page: 1,
	isLoading: false,
	isMoreData: true,
	getInitialState: function() {
		return {
			notes: this.props.notes || []
		};
	},
	getNotes: function() {
		if (this.isLoading || !this.isMoreData) return;

		this.isLoading = true;
	 	jQuery.ajax({
			url: '/notes/' + (++this.page),
			dataType: 'json',
			cache: false,
			success: function(data) {
				if (data.length == 0) {
					this.isMoreData = false;
					return;
				}
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
			var scrollHandler = function(event) {
				if (!reactObject.isMoreData) {
					$(window).off('scroll', scrollHandler);
					return;
				}

				if ($(window).scrollTop() < $('div.note:nth-last-child(5)').offset().top) return;

				reactObject.getNotes();
			};

			$(function() {
				$(window).on('scroll', scrollHandler);
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
