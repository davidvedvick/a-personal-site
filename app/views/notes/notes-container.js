import ReactDomServer from 'react-dom/server';
import LayoutFactory from '../layout';
import NotesList from './notes-list';
import { div, script, hh } from 'react-hyperscript-helpers';

const NotesContainer = hh((props) => {
	const html = ReactDomServer.renderToString(NotesList({ notes: props.notes }));

	return LayoutFactory([
		div('#notes-container', { dangerouslySetInnerHTML: {__html: html} }),
		script({ type: 'text/javascript', src: '/js/notes.client.js', async: 'async' })
	]);
});

export default NotesContainer;
