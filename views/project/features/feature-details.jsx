var React = require("react");

var FeatureDetails = React.createClass({
displayName: "FeatureDetails",
	render: function() {
		return (<li class="feature-detail">{this.props.feature}</li>);
	}
});

module.exports = FeatureDetails;
