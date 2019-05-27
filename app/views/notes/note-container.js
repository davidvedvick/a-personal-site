import { hh } from 'react-hyperscript-helpers';
import Layout from '../layout';
import Note from './note/note';

export default hh((props) => Layout({subheader: 'Notes'}, [ Note({note: props.note}) ]));
