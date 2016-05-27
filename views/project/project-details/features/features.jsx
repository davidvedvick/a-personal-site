import marked from 'marked';
import { div } from 'react-hyperscript-helpers';

var Features = props =>
	div('.features', { dangerouslySetInnerHTML: {__html: marked(props.features || '', {sanitize: true})} });

module.exports = Features;
