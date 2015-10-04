var React = require('react');
var marked = require('marked');
var moment = require('moment-timezone');
var path = require('path');
var highlightJs = require('highlight.js');

var Note = React.createClass({
	shouldComponentUpdate: function (nextProps, nextState) {
		// After initial rendering, the note never changes, so leave it alone
		return false;
	},
	render: function () {
		var note = this.props.note;
		var routeUrl = path.join('/notes', note.pathYear, note.pathMonth, note.pathDay, note.pathTitle);
		var html = marked(note.text || '', {
			sanitize: true,
			highlight: function (code) {
				return highlightJs.highlightAuto(code).value;
			}
		});

		return (
			<div className="note">
				<div className="note-text" dangerouslySetInnerHTML={{__html: html}} />
				<p className="note-date">
					<em>Note posted on {moment(note.created).tz('America/Chicago').format('LLLL z')} - <a href={routeUrl}>link</a></em>
				</p>
			</div>
		);
	}
});

module.exports = Note;
