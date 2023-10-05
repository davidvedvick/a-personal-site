import Features from './features/features';
import ScreenshotList from './screenshots/screenshot-list/screenshot-list';
import { div, hh } from 'react-hyperscript-helpers';

const ProjectDetails = props => {
  const { image, body, examples } = props.project;

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
		div('.project-details-container', examples.length > 0
      ? [
        Features({ features: body }),
        ScreenshotList({
          images: examples
        })
      ]
      : [
        Features({ features: body })
      ]
    )
	]);
};

const projectDetailsFactory = hh(ProjectDetails);

export default projectDetailsFactory;
