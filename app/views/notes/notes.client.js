import {createElement} from 'react';
import { hydrateRoot } from 'react-dom/client';
import { NotesList } from './notes-list';

(async () => {
	try {
		const response = await fetch('/notes/1');
		const data = await response.json();
		hydrateRoot(document.getElementById("notes-container"), createElement(NotesList, { notes: data }), document.getElementById('notes-container'))
	} catch (err) {
		console.error(`There was an error getting the notes: ${err}.`)
	}
})();