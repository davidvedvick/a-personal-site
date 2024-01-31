import {createElement} from 'react';
import { hydrateRoot } from 'react-dom/client';
import { DynamicNotesList } from './notes-list.js';

(async () => {
	try {
		const response = await fetch('/notes/1');
		const data = await response.json();
		hydrateRoot(document.getElementById("notes-container"), createElement(DynamicNotesList, { notes: data }), document.getElementById('notes-container'))
	} catch (err) {
		console.error(`There was an error getting the notes: ${err}.`)
	}
})();