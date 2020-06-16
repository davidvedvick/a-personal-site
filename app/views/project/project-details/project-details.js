import Features from './features/features';
import ScreenshotList from './screenshots/screenshot-list/screenshot-list';
import path from 'path';
import { h2, h3, div, hh } from 'react-hyperscript-helpers';

const Title = props => h2('.title', props.title);

const Description = props => h3('.description', props.description);

const ProjectDetails = props => {
	const image = props.project.image;

	console.log(image);

	const url = image ? image.url : null;

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
		Title({ title: props.project.headline }),
		Description({ description: props.project.summary }),
		div('.project-details-container', [
			Features({ features: props.project.body })/*,
			ScreenshotList({
				images: props.project.examples
			})*/
		])
	]);
};

const projectDetailsFactory = hh(ProjectDetails);

export default projectDetailsFactory;
