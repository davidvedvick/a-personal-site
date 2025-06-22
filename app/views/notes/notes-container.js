import LayoutFactory from '../layout.js';
import {NotesList} from './notes-list.js';
import pkg from 'react-hyperscript-helpers';

const { div, script, hh, a, img } = pkg;

const NotesContainer = hh((props) => {
	return LayoutFactory(
    { subheader: "Notes" },
    [
      div('#rss-container', [
        a('#rss-link', { href: '/notes/rss.xml' }, [
          img({ src: '/imgs/rss.svg', alt: 'Get the Feed!' })
        ]),
      ]),
      div({ id: 'notes-container' }, [ NotesList(props) ]),
      script({ type: 'text/javascript', src: '/js/notes.client.js', async: 'async' })
    ]
  );
});

export default NotesContainer;
