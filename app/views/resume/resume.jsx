import { div, a, img, hh } from 'react-hyperscript-helpers';
import LayoutFactory from '../layout';
import marked from 'marked';

const Resume = hh((props) => LayoutFactory({ subheader: 'Resume' }, [
	div('.resume', [
		a('#pdf-version', { href: '/resume.pdf' }, [
			img({ src: '/imgs/file-pdf.svg', alt: 'View the PDF version!' })
		]),
		div('.resume-content', { dangerouslySetInnerHTML: {__html: marked((props.resume || '').toString(), {sanitize: false})} })
	])
]));

module.exports = Resume;
