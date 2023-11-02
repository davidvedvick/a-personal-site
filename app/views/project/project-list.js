import ProjectDetails from './project-details/project-details.js';
import Layout from '../layout.js';
import pkg from 'react-hyperscript-helpers';
const {hh, script} = pkg;

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

export default Index;
