import marked from 'marked';
import moment from 'moment-timezone';
import path from 'path';
import highlightJs from 'highlight.js';
import { div, a, em, p } from 'react-hyperscript-helpers';

const Note = (props) => {
	const note = props.note;
	const routeUrl = path.join('/notes', note.pathYear, note.pathMonth, note.pathDay, note.pathTitle);
	const html = marked(note.text || '', {
		sanitize: true,
		highlight: (code) => highlightJs.highlightAuto(code).value
	});

	return div('.note', [
		div('.note-text', { dangerouslySetInnerHTML: { __html: html } }),
		p('.note-date', [ em(`Note posted on ${moment(note.created).tz('America/Chicago').format('LLLL z')} - `, [ a({ href: routeUrl }, 'link') ]) ])
	]);
};

export default Note;
