const gulp = require('gulp');
const gutil = require('gulp-util');
const uglify = require('gulp-uglify');
const through2 = require('through2');
const parallel = require('concurrent-transform');
const os = require('os');
const React = require('react');
const ReactDomServer = require('react-dom/server');
const appConfig = Object.assign(require('./app/app-config.json'), require('./app-config.json'));
const path = require('path');
const GulpSsh = require('gulp-ssh');
const gulpSsh = new GulpSsh({
	ignoreErrors: false,
	// set this from a config file
	sshConfig: require('./ssh-config.json')
});
const htmlmin = require('gulp-htmlmin');
const gulpBabel = require('gulp-babel');
const del = require('del');
const revertPath = require('gulp-revert-path');

const numberOfCpus = os.cpus().length;

// Register dynamic build tasks
(() => require('./app/gulpfile.js')({ production: true }))();

// Static build tasks
var rawMarkdown = {};

var jsxToHtml = (options) =>
	through2.obj(function (file, enc, cb) {
		require('node-jsx').install({extension: '.jsx'});

		var component = require(file.path);
		component = component.default || component;
		const markup = '<!doctype html>' + ReactDomServer.renderToStaticMarkup(React.createElement(component, options));
		file.contents = new Buffer(markup);
		file.path = gutil.replaceExtension(file.path, '.html');

		this.push(file);

		cb();
	});

var hashDest = (dest, opts) =>
	through2.obj((file, enc, cb) => {
		opts = opts || {};

		dest[file.path.replace(file.base, '')] = opts.onStore ? opts.onStore(file.contents) : file.contents.toString(opts.enc || enc);
		cb();
	});

gulp.task('clean-build', (cb) => { del(['build']).then(() => cb()); });

gulp.task('copy-dynamic-build', ['clean-build', 'build'],
	() =>
		gulp.src(['./app/public/**/*']).pipe(gulp.dest('./build/public')));

gulp.task('build-server-js', ['clean-build'],
	() =>
		gulp
			.src([ './app/**/*.{js,jsx}', '!./**/app-debug.js', '!./app/**/*.client.{.js,jsx}', '!./**/public/**/*' ])
			.pipe(parallel(gulpBabel({ presets: [ 'es2015', 'react', '@niftyco/babel-node' ] }), numberOfCpus))
			.pipe(revertPath())
			.pipe(parallel(uglify(), numberOfCpus))
			.pipe(gulp.dest('build')));

gulp.task('store-resume-markdown',
	() =>
		gulp
			.src(appConfig.resumeLocation)
			.pipe(hashDest(rawMarkdown)));

gulp.task('build-static-resume', ['build-server-js', 'store-resume-markdown'],
	() =>
		gulp
			.src('./build/views/resume/resume.jsx')
			.pipe(jsxToHtml({resume: rawMarkdown['resume.md']}))
			.pipe(htmlmin())
			.pipe(gulp.dest('./build/public/html')));

gulp.task('store-bio-markdown',
	() =>
		gulp
			.src(appConfig.bio.path)
			.pipe(hashDest(rawMarkdown)));

gulp.task('build-static-index', ['build-server-js', 'store-bio-markdown'],
	() =>
		gulp
			.src('./build/views/index/index.jsx')
			.pipe(jsxToHtml({bio: rawMarkdown['bio.md']}))
			.pipe(htmlmin())
			.pipe(gulp.dest('./build/public/html')));

var projectMarkdown = {};
gulp.task('store-project-markdown',
	() =>
		gulp
			.src(path.join(appConfig.projectsLocation, '*/features.md'))
			.pipe(hashDest(projectMarkdown)));

var projectData = {};
gulp.task('store-project-json', ['store-project-markdown'],
	() =>
		gulp
			.src(path.join(appConfig.projectsLocation, 'projects.json'))
			.pipe(hashDest(projectData, {
				onStore: (data) => {
					const projects = JSON.parse(data);

					projects.forEach((project) => {
						project.features = projectMarkdown[project.name + '/features.md'];
					});

					return projects;
				}
			})));

gulp.task('build-static-projects', ['build-server-js', 'store-project-json'],
	() =>
		gulp
			.src('./build/views/project/project-list.jsx')
			.pipe(jsxToHtml({projects: projectData['projects.json'] || []}))
			.pipe(htmlmin())
			.pipe(gulp.dest('./build/public/html')));

gulp.task('copy-node-project-data', ['clean-build'],
	() =>
		gulp.src(['./package.json', './app/start-server.sh']).pipe(gulp.dest('./build')));

gulp.task('build-static', [
	'clean-build',
	'build',
	'copy-dynamic-build',
	'copy-node-project-data',
	'build-static-resume',
	'build-static-index',
	'build-static-projects',
	'build-server-js']);

gulp.task('publish', ['build-static'],
	() =>
		gulp
			.src(['./build/**/*', './package.json'])
			.pipe(gulpSsh.dest('/home/protected/app')));

gulp.task('update-server', ['publish'],
	// uninstall all the packages: `npm ls -p --depth=0 | awk -F/node_modules/ '{print $2}' | grep -vE '^(npm|)$' | xargs -r npm uninstall`
	() =>
		gulpSsh.shell([
			'cd /home/protected/app/',
			'chmod +x start-server.sh',
			'npm install --production',
			'npm update --production',
			'npm prune --production',
			'npm dedupe',
			'rm -rf /home/tmp/npm*',
			'npm cache clean'
		]));

gulp.task('deploy', ['publish', 'update-server']);
