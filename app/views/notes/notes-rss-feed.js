function NotesItem(rootUrl, note) {
  return `<item>
   <title>${note.title}</title>
   <link>${rootUrl}${note.path}</link>
</item>`;
}

export function NotesRssFeed(rootUrl, notes) {
  return `<rss version="2.0">
    <channel>
        <title>David Vedvick (Notes Feed)</title>
         <link>${rootUrl}</link>
        ${notes.map(n => NotesItem(rootUrl, n)).join('\n')}
    </channel>
  </rss>`;
}