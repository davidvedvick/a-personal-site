import { marked } from 'marked';
import highlightJs from "highlight.js";
import pkg from 'react-hyperscript-helpers';
const { div, hh } = pkg;

export default hh((props) =>
	div(
    '.features',
    {
      dangerouslySetInnerHTML: {
        __html: marked(
          props.features || '',
          {
            sanitize: true,
            highlight: (code) => highlightJs.highlightAuto(code).value,
          }
        )
      }
    }
  )
);
