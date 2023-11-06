import { marked } from 'marked';
import highlightJs from "highlight.js";
import sanitizeHtml from 'sanitize-html';
import pkg from 'react-hyperscript-helpers';
const { div, hh } = pkg;

export default hh((props) =>
	div(
    '.features',
    {
      dangerouslySetInnerHTML: {
        __html: sanitizeHtml(marked(
          props.features || '',
          {
            highlight: (code) => highlightJs.highlightAuto(code).value,
          }
        ))
      }
    }
  )
);
