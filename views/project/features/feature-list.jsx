var React = require("react");
var FeatureDetails = require("./feature-details");

var FeatureList = React.createClass({
    displayName: "FeatureList",
    render: function () {
        var featureNodes = this.props.features.map(function (feature) {
            return (<FeatureDetails feature={feature} />);
        });

        return (
            <ul class="feature-list">{featureNodes}</ul>
        );
    }
});

module.exports = FeatureList;
