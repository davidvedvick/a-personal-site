import ReactDomServer from 'react-dom/server.node.js';
import LayoutFactory from '../layout.js';
import { NotesList } from './notes-list.js';
import React from "react";
import pkg from 'react-hyperscript-helpers';
const { div, script, hh } = pkg;

const NotesContainer = hh((props) => {
	const html = ReactDomServer.renderToString(React.createElement(NotesList, { notes: props.notes }));

	return LayoutFactory([
		div('#notes-container', { dangerouslySetInnerHTML: {__html: html} }),
		script({ type: 'text/javascript', src: '/js/notes.client.js', async: 'async' })
	]);
});

export default NotesContainer;
