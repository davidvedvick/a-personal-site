import { script, hh } from 'react-hyperscript-helpers';
import ProjectDetails from './project-details/project-details';
import Layout from '../layout';

const Index = hh((props) =>
	Layout(
		{ subheader: 'Side Projects' },
		[ script({ type: 'text/javascript', src: '/js/project.client.js' }) ]
		.concat(
			props
			.projects
			.map((project) => ProjectDetails({ project: project })))));

module.exports = Index;
