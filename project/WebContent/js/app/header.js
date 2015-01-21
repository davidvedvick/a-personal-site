const dom = React.DOM;

var Header = React.createClass({
	displayName: "Header",
	render: function() {
		return dom.header(
			null,
			dom.div(
				{ className: 'header' },
				dom.h1(null, "Last Hope Enterprises"),
				dom.h2(null, "When you know you're fucked, turn here")
			)
		);
	}
});