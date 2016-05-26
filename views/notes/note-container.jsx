// import h from 'react-hyperscript-helpers';
import Layout from '../layout';
import Note from './note/note';

export default (props) => Layout({subheader: 'Notes'}, [ Note({note: props.note}) ]);
