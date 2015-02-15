var React = require("react");

var Screenshot = React.createClass({
        displayName: "Screenshot",
        render: function() {
	        return (
	                <img src="{this.props.src}" />
	        );
        }
});

Module.exports = Screenshot;