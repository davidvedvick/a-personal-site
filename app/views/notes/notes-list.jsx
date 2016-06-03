import React from 'react';
import Note from './note/note';
import jQuery from 'jquery';
import { div, hh } from 'react-hyperscript-helpers';

class NotesList extends React.Component {
	constructor (props) {
		super(props);

		this.page = 1;
		this.state = { notes: this.props.notes || [] };
	}

	loadMoreNotesIfNecessary () {
		if (jQuery(window).scrollTop() >= jQuery('div.note:nth-last-child(5)').offset().top)
			this.getNotes();
	}

	getNotes () {
		const reactObject = this;
		jQuery(window).off('scroll', reactObject.loadMoreNotesIfNecessary);

		jQuery.ajax({
			url: '/notes/' + (++reactObject.page),
			dataType: 'json',
			cache: false,
			success: (data) => {
				if (data.length === 0) return;

				reactObject.setState({notes: reactObject.state.notes.concat(data)});
				jQuery(window).on('scroll', reactObject.loadMoreNotesIfNecessary);
			},
			error: (xhr, status, err) => {
				console.error(err.toString());
				jQuery(window).on('scroll', reactObject.loadMoreNotesIfNecessary);
			}
		});
	}

	componentDidMount () {
		const reactObject = this;
		(($) => {
			$(() => {
				$(window).on('scroll', reactObject.loadMoreNotesIfNecessary);
				reactObject.loadMoreNotesIfNecessary();
			});
		})(jQuery);
	}

	render () {
		// notes objects should look like "{title, date, text}". don't include private
		// ones
		var noteNodes = (this.state.notes || [])
			.map((note) => Note({ note: note, key: note.hash }));

		return div(noteNodes);
	}
}

export { NotesList };

export default hh((props) => new NotesList(props));
