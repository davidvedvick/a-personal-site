import {Marked, Renderer} from "marked";
import {configuredMarkedHighlighter} from "../markdown/configured-marked-highlighter.js";
import {sanitize} from "../markdown/configured-sanitizer.js";
import {encode} from 'html-entities';

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

function NotesItem(rootUrl, note) {
  if (!note.created) {
    console.log(`Note ${note.title} has null created!`)
  }

  return `<entry>
   <title>${note.title}</title>
   <link href="${rootUrl}${note.path}" />
   <updated>${note.created.toISOString()}</updated>
   <id>${rootUrl}${note.path}</id>
   <content type="html" xml:base="${rootUrl}">
     ${encode(sanitize(marked.parse(note.text || '')))}
  </content>
</entry>`;
}

export function NotesAtomFeed(rootUrl, notes) {
  const sortedNotes = notes
    .filter(n => isFinite(n.created))
    .sort((a, b) => (a.created > b.created) - (a.created < b.created));

  return `
    <feed xmlns="http://www.w3.org/2005/Atom">
        <title>David Vedvick (Notes Feed)</title>
        <id>${rootUrl}</id>
         <link href="${rootUrl}" />
         <link href="${rootUrl}/atom.xml" rel="self" />
         <updated>${sortedNotes.at(-1).created.toISOString()}</updated>
         <author>
            <name>David Vedvick</name>
            <email>dvedvick@gmail.com</email>
         </author>
        ${sortedNotes.map(n => NotesItem(rootUrl, n)).join('\n')}
    </feed>`;
}