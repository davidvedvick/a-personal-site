import Features from './features/features';
import ScreenshotList from './screenshots/screenshot-list/screenshot-list';
import path from 'path';
import { h2, h3, div, hh } from 'react-hyperscript-helpers';

const Title = props => h2('.title', props.title);

const Description = props => h3('.description', props.description);

const ProjectDetails = props => {
	const baseImgPath = path.join('/', 'imgs', 'projects', props.project.name, 'imgs');

	const headerBackgroundStyle = {
		backgroundImage: [
			'url(\'/imgs/transparent-bg-pixel.png\')',
			'url(\'' + path.join(baseImgPath, props.project.headlineImage.path || '') + '\')'
		],
		backgroundRepeat: [
			'repeat',
			'no-repeat'
		]
	};

	return div('.project', { style: headerBackgroundStyle }, [
		Title({ title: props.project.prettyName || props.project.name }),
		Description({ description: props.project.description }),
		div('.project-details-container', [
			Features({ features: props.project.features }),
			ScreenshotList({
				images: props.project.images,
				base: baseImgPath
			})
		])
	]);
};

const projectDetailsFactory = hh(ProjectDetails);

export default projectDetailsFactory;
