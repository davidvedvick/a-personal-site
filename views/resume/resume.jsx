import { div, a, img } from 'react-hyperscript-helpers';
import Layout from '../layout';
import marked from 'marked';

var Resume = props => Layout({ subheader: 'Resume' }, [
	div('.resume', [
		a('#pdf-version', { href: '/resume.pdf' }, [
			img({ src: '/imgs/file-pdf.svg', alt: 'View the PDF version!' })
		]),
		div('.resume-content', { dangerouslySetInnerHTML: {__html: marked((props.resume || '').toString(), {sanitize: true})} })
	])
]);

module.exports = Resume;
