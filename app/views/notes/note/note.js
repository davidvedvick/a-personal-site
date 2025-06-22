import {Marked, Renderer} from 'marked';
import moment from 'moment-timezone';
import pkg from 'react-hyperscript-helpers';
import {sanitize} from "../../markdown/configured-sanitizer.js";
import {configuredMarkedHighlighter} from "../../markdown/configured-marked-highlighter.js";

const {div, a, em, p, hh} = pkg;

const renderer = new Renderer();
renderer.image = (href, title, text) => {
  if (href.startsWith('./'))
    href = `/notes/${href.replace(/^\.\/+/, '')}`;

  let returnTag = `<img src="${href}"`;

  if (title)
    returnTag += ` title="${title}"`;

  if (text)
    returnTag += ` alt="${text}"`;

  returnTag += ' />';

  return returnTag;
}

const marked = new Marked({ renderer }, configuredMarkedHighlighter);

const Note = hh((props) => {
    const note = props.note;

    const html = sanitize(marked.parse(note.text || ''));

    return div({ className: 'note', id: note.hash }, [
        div('.note-text', {dangerouslySetInnerHTML: {__html: html}}),
        p('.note-date', [em([
          `Note posted on ${moment(note.created).tz('America/Chicago').format('LLLL z')} - `,
          a({href: note.path}, 'link')]
        )])
    ]);
});

export default Note;
