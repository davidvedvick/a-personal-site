var React = require('react');
var ReactDomServer = require('react-dom/server');
var Layout = require('../layout');
var NotesList = require('./notes-list');

var NotesContainer = React.createClass({
	render: function() {
		return (
			<Layout subheader="Notes">
				<div id="notes-container" dangerouslySetInnerHTML={{__html: ReactDomServer.renderToString(React.createElement(NotesList, { notes: this.props.notes }))}} />

				<script type="text/javascript" src="/js/notes.client.js" />
			</Layout>
		);
	}
});

module.exports = NotesContainer;
