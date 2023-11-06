import { hh } from 'react-hyperscript-helpers';
import Layout from '../layout.js';
import Note from './note/note.js';

export default hh((props) => Layout({subheader: 'Notes'}, [ Note({note: props.note}) ]));
