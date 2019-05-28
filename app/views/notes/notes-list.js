import React from 'react';
import Note from './note/note';
import jQuery from 'jquery';
import { div, hh } from 'react-hyperscript-helpers';

class NotesList extends React.Component {
	constructor (props) {
		super(props);

		this.page = 1;
		this.state = { notes: this.props.notes || [] };

		const loadMoreNotesIfNecessary = () => {
			if (jQuery(window).scrollTop() < jQuery('div.note:nth-last-child(5)').offset().top) return;

			jQuery(window).off('scroll', loadMoreNotesIfNecessary);

			jQuery.ajax({
				url: '/notes/' + (++this.page),
				dataType: 'json',
				cache: false,
				success: (data) => {
					if (data.length === 0) return;

					this.setState({notes: this.state.notes.concat(data)});
					jQuery(window).on('scroll', loadMoreNotesIfNecessary);
				},
				error: (xhr, status, err) => {
					console.error(err.toString());
					jQuery(window).on('scroll', loadMoreNotesIfNecessary);
				}
			});
		};

		this.loadMoreNotesIfNecessary = loadMoreNotesIfNecessary;
	}

	componentDidMount () {
		(($) => {
			$(() => {
				$(window).on('scroll', this.loadMoreNotesIfNecessary);
				this.loadMoreNotesIfNecessary();
			});
		})(jQuery);
	}

	render () {
		// notes objects should look like "{title, date, text}". don't include private
		// ones
		const noteNodes = (this.state.notes || [])
			.map((note) => Note({ note: note, key: note.hash }));

		return div(noteNodes);
	}
}

export { NotesList };

export default hh((props) => new NotesList(props));
