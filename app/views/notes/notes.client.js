import React from 'react';
import ReactDOM from 'react-dom';
import { NotesList } from './notes-list';

(async () => {
	try {
		const response = await fetch('/notes/1');
		const data = await response.json();
		ReactDOM.hydrate(React.createElement(NotesList, { notes: data }), document.getElementById('notes-container'))
	} catch (err) {
		console.error(`There was an error getting the notes: ${err}.`)
	}
})();