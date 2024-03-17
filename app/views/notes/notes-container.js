import LayoutFactory from '../layout.js';
import {NotesList} from './notes-list.js';
import pkg from 'react-hyperscript-helpers';

const { div, script, hh } = pkg;

const NotesContainer = hh((props) => {
	return LayoutFactory(
    { subheader: "Notes" },
    [
      div({ id: 'notes-container' }, [ NotesList({ notes: props.notes }) ]),
      script({ type: 'text/javascript', src: '/js/notes.client.js', async: 'async' })
    ]
  );
});

export default NotesContainer;
