const gulp = require('gulp');
const gutil = require('gulp-util');
const terser = require('gulp-terser');
const through2 = require('through2');
const parallel = require('concurrent-transform');
const os = require('os');
const React = require('react');
const ReactDomServer = require('react-dom/server');
const appConfig = Object.assign(require('./app/app-config.json'), require('./app-config.json'));
const path = require('path');
const GulpSsh = require('gulp-ssh');
const gulpSsh = () => new GulpSsh({
	ignoreErrors: false,
	// set this from a config file
	sshConfig: require('./ssh-config.json')
});
const htmlmin = require('gulp-htmlmin');
const gulpBabel = require('gulp-babel');
const del = require('del');
const { promisify } = require('util');
const fs = require('fs');
const debug = require('gulp-debug');
const rename = require('gulp-rename');

const numberOfCpus = os.cpus().length;

process.env.NODE_ENV = "production";

// Register dynamic build tasks
const appBuild = require('./app/gulpfile.js')({ production: true });

const promiseReadFile = (filePath) => promisify(fs.readFile)(filePath, 'utf8');

const promiseStream = (gulpStream) => new Promise((resolve, reject) => gulpStream.on('end', resolve).on('error', reject));

// Static build tasks
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

const cleanBuild = () => del(['build']);

function copyDynamicBuild() {
	return gulp.src(['./app/public/**/*']).pipe(gulp.dest('./build/public'));
}

function buildServerJs() {
	return gulp
		.src([ './app/**/*.js', '!./**/app-debug.js', '!./app/**/*.client.{.js,jsx}', '!./**/public/**/*', '!./**/gulpfile*.js' ], { allowEmpty: true })
		.pipe(parallel(gulpBabel({ presets: [ ['@babel/preset-env', {
			"targets": {
				"node": "v8.15.1"
			}
		}] ] }), numberOfCpus))
		.pipe(parallel(terser(), numberOfCpus))
		.pipe(gulp.dest('./build'));
}

async function buildStaticResume() {
	const rawMarkdown = await promiseReadFile(appConfig.resumeLocation);

	await promiseStream(gulp
			.src('./build/views/resume/resume.js')
			.pipe(jsxToHtml({resume: rawMarkdown}))
			.pipe(htmlmin())
			.pipe(gulp.dest('./build/public/html')));
}

async function buildStaticIndex() {
	const rawMarkdown = await promiseReadFile(appConfig.bio.path);

	await promiseStream(gulp
			.src('./build/views/index/index.js')
			.pipe(jsxToHtml({bio: rawMarkdown}))
			.pipe(htmlmin())
			.pipe(gulp.dest('./build/public/html')));
}

async function buildStaticProjects() {
	let projects = JSON.parse(await promiseReadFile(path.join(appConfig.projectsLocation, 'projects.json')));

	projects = await Promise.all(projects.map(async project => {
		const filePath = path.join(appConfig.projectsLocation, project.name, 'features.md');
		project.features = await promiseReadFile(filePath);
		return project;
	}));

	await promiseStream(gulp
		.src('./build/views/project/project-list.js')
		.pipe(jsxToHtml({projects: projects}))
		.pipe(htmlmin())
		.pipe(gulp.dest('./build/public/html')));
}

const copyNodeProjectData = () => gulp.src(['./package.json', './app/start-server.sh']).pipe(gulp.dest('./build'));

const buildStatic = gulp.series(
	cleanBuild,
	gulp.parallel(
		gulp.series(
			appBuild.build,
			copyDynamicBuild),
		copyNodeProjectData,
		gulp.series(
			buildServerJs,
			gulp.parallel(
				buildStaticResume,
				buildStaticIndex,
				buildStaticProjects))));

function publish() {
	return gulp
		.src(['./build/**/*', './package.json'])
		.pipe(gulpSsh().dest('/home/protected/app'));
}

function publishPublic() {
	return gulp
		.src('./build/public/**/*')
		.pipe(gulpSsh().dest('/home/protected/app/public'));
}

function publishHtml() {
	return gulp
		.src('./build/public/**/*.html')
		.pipe(gulpSsh().dest('/home/protected/app/public'));
}

function publishImages() {
	return gulp
		.src('./build/public/**/*')
		.pipe(gulpSsh().dest('/home/protected/app/public'));
}

const publishBiography = gulp.series(
	cleanBuild,
	buildServerJs,
	buildStaticIndex,
	publishHtml);

const publishResume = gulp.series(
	cleanBuild,
	appBuild.buildResumePdf,
	copyDynamicBuild,
	buildServerJs,
	buildStaticResume,
	publishPublic);

const publishProjects = gulp.series(
	cleanBuild,
	appBuild.buildImages,
	copyDynamicBuild,
	buildServerJs,
	buildStaticProjects,
	publishHtml,
	publishImages);

const updateServerPackages = () =>
	gulpSsh().shell([
		'cd /home/protected/app/',
		'chmod +x start-server.sh',
		'npm install --production',
		'npm update --production',
		'npm prune --production',
		'npm dedupe',
		'rm -rf /home/tmp/npm*',
		'npm cache clean'
	]);

const deploy = gulp.series(buildStatic, publish, updateServerPackages);

module.exports.deploy = deploy;
module.exports.buildStatic = buildStatic;
module.exports.publishBiography = publishBiography;
module.exports.publishResume = publishResume;
module.exports.publishProjects = publishProjects;
