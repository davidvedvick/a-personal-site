var React = require("React");

var FeatureList = React.createClass({
    displayName: "Features",
    render: function () {
        return (
            <ul>
                <FeatureDetail></FeatureDetail>
            </ul>
        );
    }
});

module.exports = FeatureList;
