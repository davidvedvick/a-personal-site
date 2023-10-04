import Features from './features/features';
import ScreenshotList from './screenshots/screenshot-list/screenshot-list';
import { div, hh } from 'react-hyperscript-helpers';

const ProjectDetails = props => {
	const image = props.project.image;

	const url = image?.url;

	const headerBackgroundStyle = {
		backgroundImage: [
			'url(\'/imgs/transparent-bg-pixel.png\')',
			'url(\'' + (url || '') + '\')'
		],
		backgroundRepeat: [
			'repeat',
			'no-repeat'
		]
	};

	return div('.project', { style: headerBackgroundStyle }, [
		div('.project-details-container', [
			Features({ features: props.project.body }),
			ScreenshotList({
				images: props.project.examples
			})
		])
	]);
};

const projectDetailsFactory = hh(ProjectDetails);

export default projectDetailsFactory;
