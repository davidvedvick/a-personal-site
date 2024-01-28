import {Marked} from 'marked';
import pkg from 'react-hyperscript-helpers';
import {configuredMarkedHighlighter} from "../../../markdown/configured-marked-highlighter.js";
import {sanitize} from "../../../markdown/configured-sanitizer.js";
const { div, hh } = pkg;

const marked = new Marked(configuredMarkedHighlighter);

export default hh((props) =>
	div(
    '.features',
    {
      dangerouslySetInnerHTML: {
        __html: sanitize(marked.parse(props.features || ''))
      }
    }
  )
);
