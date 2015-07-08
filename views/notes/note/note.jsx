var React = require('react');
var marked = require('marked');
var moment = require('moment');
var path = require('path');

var Note = React.createClass({
	shouldComponentUpdate: function(nextProps, nextState) {
		// After initial rendering, the note never changes, so leave it alone
		return false;
	},
	render: function() {
		var note = this.props.note;
		var routeUrl = path.join('/notes', note.pathYear, note.pathMonth, note.pathDay, note.pathTitle);
		return (
			<div className="note">
				<h2 className="note-title"><a href={routeUrl}>{note.title}</a></h2>
				<div className="note-text" dangerouslySetInnerHTML={{__html: marked(note.text || "", {sanitize: true})}} />
				<p className="note-date">
					<em>Note posted on {moment(note.created).format('LLLL')}</em>
				</p>
			</div>
		);
	}
});

module.exports = Note;
