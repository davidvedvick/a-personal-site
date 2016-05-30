import React from 'react';
import Note from './note/note';
import jQuery from 'jquery';
import { div } from 'react-hyperscript-helpers';

var NotesList = React.createClass({
	page: 1,
	getInitialState: function () {
		return {
			notes: this.props.notes || []
		};
	},
	loadMoreNotesIfNecessary: function () {
		if (jQuery(window).scrollTop() >= jQuery('div.note:nth-last-child(5)').offset().top)
			this.getNotes();
	},
	getNotes: function () {
		jQuery(window).off('scroll', this.loadMoreNotesIfNecessary);

		const reactObject = this;
		jQuery.ajax({
			url: '/notes/' + (++reactObject.page),
			dataType: 'json',
			cache: false,
			success: (data) => {
				if (data.length === 0) return;

				this.setState({notes: reactObject.state.notes.concat(data)});
				jQuery(window).on('scroll', reactObject.loadMoreNotesIfNecessary);
			},
			error: (xhr, status, err) => {
				console.error(err.toString());
				jQuery(window).on('scroll', reactObject.loadMoreNotesIfNecessary);
			}
		});
	},
	componentDidMount: function () {
		var reactObject = this;
		(($) => {
			$(() => {
				$(window).on('scroll', reactObject.loadMoreNotesIfNecessary);
				reactObject.loadMoreNotesIfNecessary();
			});
		})(jQuery);
	},
	render: function () {
		// notes objects should look like "{title, date, text}". don't include private
		// ones
		var noteNodes = (this.state.notes || [])
			.map((note) => Note({ note: note, key: note.hash }));

		return div(noteNodes);
	}
});

module.exports = NotesList;
