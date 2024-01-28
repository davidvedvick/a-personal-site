import {Marked, Renderer} from 'marked';
import moment from 'moment-timezone';
import path from 'path';
import highlightJs from 'highlight.js';
import pkg from 'react-hyperscript-helpers';
import {markedHighlight} from "marked-highlight";
import sanitizeHtml from "sanitize-html";
import {sanitize} from "../../markdown/configured-sanitizer.js";
import {configuredMarkedHighlighter} from "../../markdown/configured-marked-highlighter.js";

const {div, a, em, p, hh} = pkg;

const renderer = new Renderer();
renderer.image = (href, title, text) => {
    if (href.startsWith('./'))
        href = '/notes/' + href.replace(/^\.\/+/, '');

    let returnTag = `<image src="${href}"`;

    if (title)
        returnTag += ` title="${title}"`;

    if (text)
        returnTag += ` alt="${text}"`;

    returnTag += '>';

    return returnTag;
}

const marked = new Marked({ renderer: renderer }, configuredMarkedHighlighter);

const Note = hh((props) => {
    const note = props.note;
    const routeUrl = path.join('/notes', note.pathYear, note.pathMonth, note.pathDay, note.pathTitle);

    const html = marked.parse(sanitize(note.text || ''));

    return div('.note', [
        div('.note-text', {dangerouslySetInnerHTML: {__html: html}}),
        p('.note-date', [em([`Note posted on ${moment(note.created).tz('America/Chicago').format('LLLL z')} - `, a({href: routeUrl}, 'link')])])
    ]);
});

export default Note;
