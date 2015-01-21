const header = require("header")

var Layout = React.createClass({
	displayName: "Layout",
	render: function() {
		return dom.div(
			{ className: "layout" },
			Header()
		)
	}
});