var React = require("react");
var marked = require("marked");

var Features = React.createClass({
	render: function() {
		return (<div className="features" dangerouslySetInnerHTML={{__html: marked(this.props.features.toString(), {sanitize: true})}} />)
	}
});

module.exports = Features;
