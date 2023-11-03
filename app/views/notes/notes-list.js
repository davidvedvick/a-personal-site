import React from 'react';
import Note from './note/note.js';
import pkg from 'react-hyperscript-helpers';
const { div, hh } = pkg;

class NotesList extends React.Component {
	constructor (props) {
		super(props);

		this.page = 1;
		this.state = { notes: this.props.notes || [] };

		const loadingThreshold = () => {
			const fifthLastNote = document.querySelector('div.note:nth-last-child(5)');
			if (!fifthLastNote) return -1;
			
			const rect = fifthLastNote.getBoundingClientRect();
			return rect.top + window.scrollY;
		}

		const loadMoreNotesIfNecessary = async () => {
			if (window.scrollY < loadingThreshold()) return;

			window.removeEventListener('scroll', loadMoreNotesIfNecessary);

			try {
				const response = await fetch(`/notes/${++this.page}`);
				const data = await response.json();
				if (data.length > 0)
					this.setState({notes: this.state.notes.concat(data)});
			} catch (err) {
				console.error(`There was an error getting the notes: ${err}.`)
			} finally {
				window.addEventListener('scroll', loadMoreNotesIfNecessary)
			}
		};

		this.loadMoreNotesIfNecessary = loadMoreNotesIfNecessary;
	}

	componentDidMount () {
		window.addEventListener('scroll', this.loadMoreNotesIfNecessary);
		this.loadMoreNotesIfNecessary();
	}

	render () {
		// notes objects should look like "{title, date, text}". don't include private ones
		const noteNodes = (this.state.notes || [])
			.map((note) => Note({ note: note, key: note.hash }));

		return div(noteNodes);
	}
}

export { NotesList };

export default hh((props) => new NotesList(props));
