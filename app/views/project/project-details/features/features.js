import { marked } from 'marked';
import { div, hh } from 'react-hyperscript-helpers';
import highlightJs from "highlight.js";

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
