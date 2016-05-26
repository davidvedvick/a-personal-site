var React = require('react');
var marked = require('marked');
var moment = require('moment-timezone');
var path = require('path');
var highlightJs = require('highlight.js');
import { div, a, em, p } from 'react-hyperscript-helpers';

var Note = React.createClass({
	shouldComponentUpdate: function (nextProps, nextState) {
		// After initial rendering, the note never changes, so leave it alone
		return false;
	},
	render: function () {
		const note = this.props.note;
		const routeUrl = path.join('/notes', note.pathYear, note.pathMonth, note.pathDay, note.pathTitle);
		const html = marked(note.text || '', {
			sanitize: true,
			highlight: function (code) {
				return highlightJs.highlightAuto(code).value;
			}
		});

		return div('.note', [
			div('.note-text', { dangerouslySetInnerHTML: { __html: html }}),
			p('.note-date', [ em(`Note posted on ${moment(note.created).tz('America/Chicago').format('LLLL z')} - `, [ a({ href: routeUrl }, 'link') ]) ])
		]);
	}
});

module.exports = Note;
