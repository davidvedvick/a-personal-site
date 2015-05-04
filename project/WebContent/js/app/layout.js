var React = require("react");
var Header = require("./header.js");
var Project = require("./project/project.js");
var $ = require("jquery");

var Layout = React.createClass({
	displayName: "Layout",
	getInitialState: function() {
		return {projects: []}
	},
	componentDidMount: function() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			success: function(data) {
				this.setState({projects: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		})
	},
	render: function() {
		var projectNodes = this.state.projects.map(function (project) {
			return (<Project project={project} />);
		});

		return (
			<div className="layout">
				<Header />
				{projectNodes}
			</div>
		);
	}
});

module.exports = Layout;
