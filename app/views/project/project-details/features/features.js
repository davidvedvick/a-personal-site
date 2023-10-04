import { marked } from 'marked';
import { div, hh } from 'react-hyperscript-helpers';

const Features = hh((props) =>
	div(
    '.features',
    { dangerouslySetInnerHTML: {__html: marked(props.features || '', {sanitize: true})} }
  )
);

module.exports = Features;
