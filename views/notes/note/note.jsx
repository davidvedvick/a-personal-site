var React = require('react');
var marked = require('marked');
var moment = require('moment');

var Note = React.createClass({
	render: function() {
		return (
			<div className="note">
				<div className="note-text" dangerouslySetInnerHTML={{__html: marked(this.props.note.text || "", {sanitize: true})}} />
				<p className="note-date">
					<em>Note posted on {moment(this.props.note.created).format('LLLL')}</em>
				</p>
			</div>
		);
	}
});

module.exports = Note;
