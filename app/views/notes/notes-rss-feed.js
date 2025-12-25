function NotesItem(rootUrl, note) {
  return `<item>
   <title>${note.title}</title>
   <link>${rootUrl}${note.path}</link>
   <pubDate>${note.created?.toUTCString()}</pubDate>
</item>`;
}

export function NotesRssFeed(rootUrl, notes) {
  return `<rss version="2.0">
    <channel>
        <title>David Vedvick (Notes Feed)</title>
         <link>${rootUrl}</link>
        ${
          notes
            .sort((a, b) => isFinite(a.created) && isFinite(b.created) ? (a.created > b.created) - (a.created < b.created) : NaN)
            .map(n => NotesItem(rootUrl, n)).join('\n')
        }
    </channel>
  </rss>`;
}