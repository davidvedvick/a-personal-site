import {hh, script} from 'react-hyperscript-helpers';
import ProjectDetails from './project-details/project-details';
import Layout from '../layout';

function boundedToOne(number) {
  return Math.max(Math.min(number, 1), -1);
}

const Index = hh((props) =>
	Layout(
		{ subheader: 'Side Projects' },
		[ script({ type: 'text/javascript', src: '/js/project.client.js' }) ]
		.concat(
			props
			.projects
      .sort((a, b) => {
        const examplesFirst = boundedToOne(b.examples.length) - boundedToOne(a.examples.length);
        if (examplesFirst !== 0) return examplesFirst;

        return a.body.localeCompare(b.body);
      })
			.map((project) => ProjectDetails({ project: project })))));

module.exports = Index;
