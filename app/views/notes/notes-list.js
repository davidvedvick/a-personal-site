import React from 'react';
import Note from './note/note';
import jQuery from 'jquery';
import { div, hh } from 'react-hyperscript-helpers';

class NotesList extends React.Component {
	constructor (props) {
		super(props);

		this.page = 1;
		this.state = { notes: this.props.notes || [] };

		const loadMoreNotesIfNecessary = async () => {
			if (jQuery(window).scrollTop() < jQuery('div.note:nth-last-child(5)').offset().top) return;

			jQuery(window).off('scroll', loadMoreNotesIfNecessary);

			try {
				const response = await fetch(`/notes/${++this.page}`);
				const data = await response.json();
				if (data.length > 0)
					this.setState({notes: this.state.notes.concat(data)});
			} catch (err) {
				console.error(`There was an error getting the notes: ${err}.`)
			} finally {
				jQuery(window).on('scroll', loadMoreNotesIfNecessary)
			}
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
