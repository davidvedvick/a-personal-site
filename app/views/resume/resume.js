import LayoutFactory from '../layout.js';
import { marked } from 'marked';
import pkg from 'react-hyperscript-helpers';
const { div, a, img, hh } = pkg;

const Resume = hh((props) => LayoutFactory({ subheader: 'Resume' }, [
	div('.resume', [
		a('#pdf-version', { href: '/resume.pdf' }, [
			img({ src: '/imgs/file-pdf.svg', alt: 'View the PDF version!' })
		]),
		div('.resume-content', { dangerouslySetInnerHTML: {__html: marked((props.resume || '').toString())} })
	])
]));

export default Resume;
