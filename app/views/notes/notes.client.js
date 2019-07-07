import React from 'react';
import ReactDOM from 'react-dom';
import { NotesList } from './notes-list';
import jQuery from 'jquery';

jQuery.ajax({
	url: '/notes/1',
	dataType: 'json',
	cache: true,
	success: function (data) {
		ReactDOM.hydrate(React.createElement(NotesList, { notes: data }), document.getElementById('notes-container'));
	},
	error: function (xhr, status, err) {
		console.error(this.props.url, status, err.toString());
	}.bind(this)
});
