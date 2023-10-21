import {hh, script} from 'react-hyperscript-helpers';
import ProjectDetails from './project-details/project-details';
import Layout from '../layout';

function boundedToOne(number) {
  return Math.min(number, 1);
}

const Index = hh((props) =>
	Layout(
		{ subheader: 'Side Projects' },
		[
      script({ type: 'text/javascript', src: '/js/project.client.js' }),
      ...props
        .projects
        .sort((a, b) => {
          const examplesFirst = boundedToOne(b.examples.length) - boundedToOne(a.examples.length);
          if (examplesFirst !== 0) return examplesFirst;

          const headlinesNext = (b.image ? 1 : 0) - (a.image ? 1 : 0)
          if (headlinesNext !== 0) return headlinesNext;

          return a.body.localeCompare(b.body);
        })
        .map((project) => ProjectDetails({ project: project }))
    ]));

module.exports = Index;
