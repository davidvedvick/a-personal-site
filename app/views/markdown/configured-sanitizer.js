import sanitizeHtml from "sanitize-html";

export function sanitize(html) {
  return sanitizeHtml(html, { allowedClasses: { '*': ['hljs*', 'language-*'] } });
}