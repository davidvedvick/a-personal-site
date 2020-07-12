import React from 'react';
import ReactDOM from 'react-dom';
import { NotesList } from './notes-list';

fetch('/notes/1')
	.then(response => response.json())
	.then(data => ReactDOM.hydrate(React.createElement(NotesList, { notes: data }), document.getElementById('notes-container')))
	.catch(err => console.error(`There was an error getting the notes: ${err}.`));