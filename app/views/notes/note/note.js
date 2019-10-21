import marked from 'marked';
import moment from 'moment-timezone';
import path from 'path';
import highlightJs from 'highlight.js';
import { div, a, em, p, hh } from 'react-hyperscript-helpers';

const Note = hh((props) => {
	const note = props.note;
	const routeUrl = path.join('/notes', note.pathYear, note.pathMonth, note.pathDay, note.pathTitle);

	const renderer = new marked.Renderer();
	renderer.image = (href, title, text) => {
		if (href.startsWith('./'))
			href = '/notes/' + href.replace(/^\.\/+/, '');

		let returnTag = `<image src="${href}"`;
		
		if (title)
			returnTag += ` title="${title}"`;

		if (text)
			returnTag += `  alt="${text}"`;
		
		returnTag += '>';

		return returnTag;
	}

	const html = marked(note.text || '', {
		sanitize: true,
		highlight: (code) => highlightJs.highlightAuto(code).value,
		renderer: renderer
	});

	return div('.note', [
		div('.note-text', { dangerouslySetInnerHTML: { __html: html } }),
		p('.note-date', [ em([ `Note posted on ${moment(note.created).tz('America/Chicago').format('LLLL z')} - `, [ a({ href: routeUrl }, 'link') ] ]) ])
	]);
});

export default Note;
