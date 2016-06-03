var ReactDOM = require('react-dom');
var NotesList = require('./notes-list');
var jQuery = require('jquery');

jQuery.ajax({
	url: '/notes/1',
	dataType: 'json',
	cache: false,
	success: function (data) {
		ReactDOM.render(NotesList({ notes: data }), document.getElementById('notes-container'));
	},
	error: function (xhr, status, err) {
		console.error(this.props.url, status, err.toString());
	}.bind(this)
});
