import LayoutFactory from '../layout.js';
import { NotesList } from './notes-list.js';
import React from "react";
import pkg from 'react-hyperscript-helpers';
import {renderToString} from "react-dom/server";
const { div, script, hh } = pkg;

const NotesContainer = hh((props) => {
	// const html = renderToString(React.createElement(NotesList, { notes: props.notes }));

	return LayoutFactory([
		div({ id: 'notes-container' }, [ hh((props) => new NotesList({ notes: props.notes })) ]),
		script({ type: 'text/javascript', src: '/js/notes.client.js', async: 'async' })
	]);
});

export default NotesContainer;
