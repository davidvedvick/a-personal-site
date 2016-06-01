const gulp = require('gulp');
const gutil = require('gulp-util');
const uglify = require('gulp-uglify');
const through2 = require('through2');
const parallel = require('concurrent-transform');
const os = require('os');
const React = require('react');
const ReactDomServer = require('react-dom/server');
const appConfig = require('./app/app-config.json');
const path = require('path');
const gulpSsh = require('gulp-ssh')({
	ignoreErrors: false,
	// set this from a config file
	sshConfig: require('./ssh-config.json')
});
const htmlmin = require('gulp-htmlmin');
const gulpBabel = require('gulp-babel');
const babelCore = require('babel-core');

const numberOfCpus = os.cpus().length;

// Register dynamic build tasks
(() => require('./app/gulpfile.js')({ production: true, outputDir: './build' }))();

// Static build tasks
var rawMarkdown = {};

var jsxToHtml = (options) =>
	through2.obj(function (file, enc, cb) {
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

gulp.task('store-resume-markdown',
	() =>
		gulp
			.src(appConfig.resumeLocation)
			.pipe(hashDest(rawMarkdown)));

gulp.task('build-static-resume', ['build', 'build-server-js', 'store-resume-markdown'],
	() =>
		gulp
			.src('./build/views/resume/resume.js')
			.pipe(jsxToHtml({resume: rawMarkdown['resume.md']}))
			.pipe(htmlmin())
			.pipe(gulp.dest('./build/public/html')));

gulp.task('store-bio-markdown',
	() =>
		gulp
			.src(appConfig.bio.path)
			.pipe(hashDest(rawMarkdown)));

gulp.task('build-static-index', ['build', 'build-server-js', 'store-bio-markdown'],
	() =>
		gulp
			.src('./build/views/index/index.js')
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
			.src(path.join('./app', appConfig.projectsLocation, 'projects.json'))
			.pipe(hashDest(projectData, {
				onStore: (data) => {
					const projects = JSON.parse(data);

					projects.forEach((project) => {
						project.features = projectMarkdown[project.name + '/features.md'];
					});

					return projects;
				}
			})));

gulp.task('build-static-projects', ['build', 'build-server-js', 'store-project-json'],
	() =>
		gulp
			.src('./build/views/project/project-list.js')
			.pipe(jsxToHtml({projects: projectData['projects.json'] || []}))
			.pipe(htmlmin())
			.pipe(gulp.dest('./build/public/html')));

gulp.task('build-server-js', ['clean-js', 'build'],
	() =>
		gulp
			.src([ './app/**/*.{js,jsx}', '!app-debug.js', '!./app/**/*.client.{.js,jsx}', '!./**/public/**/*' ])
			.pipe(parallel(gulpBabel({ presets: [ 'es2015', 'react', '@niftyco/babel-node' ] }), numberOfCpus))
			// .pipe(parallel(uglify(), numberOfCpus))
			.pipe(gulp.dest('build')));

gulp.task('build-static', ['build', 'build-static-resume', 'build-static-index', 'build-static-projects']);

gulp.task('publish-request-handlers', ['build-static'],
	() =>
		gulp
			.src(['./request-handlers/**/*.js'])
			.pipe(gulpSsh.dest('/home/protected/app/request-handlers/')));

gulp.task('publish-app', ['build-static', 'publish-request-handlers'],
	() =>
		gulp
			.src(['./app-release.js', './start-server.sh', './package.json'])
			.pipe(gulpSsh.dest('/home/protected/app/')));

gulp.task('publish-content', ['build-static'],
	() =>
		gulp
			.src('./public/**/*')
			.pipe(gulpSsh.dest('/home/protected/app/public/')));

gulp.task('publish-js', ['build-es5-js'],
	() =>
		gulp
			.src('protected')
			.pipe(gulpSsh.dest('/home/protected/')));

gulp.task('publish', ['publish-app', 'publish-content', 'publish-js']);

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