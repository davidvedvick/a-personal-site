import { div, a, img } from 'react-hyperscript-helpers';
import LayoutFactory from '../layout';
import marked from 'marked';

const Resume = (props) => LayoutFactory({ subheader: 'Resume' }, [
	div('.resume', [
		a('#pdf-version', { href: '/resume.pdf' }, [
			img({ src: '/imgs/file-pdf.svg', alt: 'View the PDF version!' })
		]),
		div('.resume-content', { dangerouslySetInnerHTML: {__html: marked((props.resume || '').toString(), {sanitize: true})} })
	])
]);

module.exports = Resume;
