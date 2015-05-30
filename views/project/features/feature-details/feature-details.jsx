var React = require("react");

var FeatureDetails = React.createClass({
displayName: "FeatureDetails",
	render: function() {
		return (<li className="feature-detail">{this.props.feature}</li>);
	}
});

module.exports = FeatureDetails;
