import {markedHighlight} from "marked-highlight";
import highlightJs from "highlight.js";

export const configuredMarkedHighlighter = markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = highlightJs.getLanguage(lang) ? lang : 'plaintext';
    return highlightJs.highlight(code, {language}, true).value;
  }
});