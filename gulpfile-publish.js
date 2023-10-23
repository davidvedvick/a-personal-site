const gulp = require('gulp');
const through2 = require('through2');
const React = require('react');
const ReactDomServer = require('react-dom/server');
const appConfig = require("./app/app-config");
const GulpSsh = require('gulp-ssh');
const sshConfig = require('./ssh-config');

const gulpSsh = () => new GulpSsh({
	ignoreErrors: false,
	// set this from a config file
	sshConfig: sshConfig
});
const htmlmin = require('gulp-htmlmin');
const del = require('del');
const { promisify } = require('util');
const fs = require('fs');
const projectLoader = require('./app/request-handlers/project-loader');
const rollup = require('rollup');
const rollupConfig = require('./rollup-config.js');
const path = require("path");
const terser = require("gulp-terser");

process.env.NODE_ENV = "production";

// Register dynamic build tasks
const appBuild = require('./app/gulpfile.js')({ production: true });

const promiseReadFile = (filePath) => promisify(fs.readFile)(filePath, 'utf8');

const promiseStream = (gulpStream) => new Promise((resolve, reject) => gulpStream.on('end', resolve).on('error', reject));

// Static build tasks
function jsxToHtml(options) {
  return through2.obj(function (file, enc, cb) {
    require('node-jsx').install({extension: '.jsx'});

    let component = {};

    if (file.contents) {
      const js = file.contents.toString("utf8", 0, file.contents.length);
      component = eval(js);
    }

    if (!component) {
      component = file.contents || require(file.path);
      component = component.default || component;
    }

    const markup = '<!doctype html>' + ReactDomServer.renderToStaticMarkup(React.createElement(component, options));
    file.contents = new Buffer(markup);
    file.path = file.path.replace(path.extname(file.path), '.html');

    this.push(file);

    cb();
  });
}

const cleanBuild = () => del(['build', 'staging']);

function copyDynamicBuild() {
	return gulp.src(['./app/public/**/*']).pipe(gulp.dest('./build/public'));
}

// noinspection JSIgnoredPromiseFromCall
function bundleJs() {
  return through2.obj(async function (file, enc, cb) {
    try {
      const bundle = await rollup.rollup(Object.assign(
        rollupConfig,
        {
          input: file.path,
        }));

      const { output } = await bundle.generate({format: 'cjs'});

      file.contents = new Buffer(output[0].code);

      this.push(file);
      cb();
    } catch (e) {
      cb(e);
    }
  });
}

function buildServerJs() {
  return gulp.src('./app/app-release.js')
    .pipe(bundleJs())
    .pipe(terser({ compress: { passes: 2, unsafe: true } }))
    .pipe(gulp.dest('./build'));
}

async function buildStaticResume() {
	const rawMarkdown = await promiseReadFile(appConfig.resumeLocation);

	await promiseStream(gulp
		.src('./app/views/resume/resume.js')
		.pipe(bundleJs())
		.pipe(jsxToHtml({resume: rawMarkdown}))
		.pipe(htmlmin())
		.pipe(gulp.dest('./build/public/html')));
}

async function buildStaticIndex() {
	const rawMarkdown = await promiseReadFile(appConfig.bio.path);

	await promiseStream(gulp
		.src('./app/views/index/index.js')
		.pipe(bundleJs())
		.pipe(jsxToHtml({bio: rawMarkdown}))
		.pipe(htmlmin())
		.pipe(gulp.dest('./build/public/html')));
}

async function buildStaticProjects() {
	const portfolios = await projectLoader();

	await promiseStream(gulp
		.src('./app/views/project/project-list.js')
		.pipe(bundleJs())
		.pipe(jsxToHtml({projects: portfolios}))
		.pipe(htmlmin())
		.pipe(gulp.dest('./build/public/html')));
}

const copyNodeProjectData = () => gulp.src(['./package.json', './app/start-server.sh']).pipe(gulp.dest('./build'));

const buildStatic = gulp.series(
	cleanBuild,
	gulp.parallel(
		appBuild.copyPublicFonts,
		gulp.series(
			appBuild.build,
			copyDynamicBuild),
		copyNodeProjectData,
		buildServerJs,
		buildStaticIndex,
		buildStaticResume,
		buildStaticProjects,
  )
);

function publishToStaging() {
	return gulp
		.src(['./build/**/*', './package.json', './package-lock.json'])
		.pipe(gulp.dest('./staging'));
}

function publishPublic() {
	return gulp
		.src('./build/public/**/*')
		.pipe(gulpSsh().dest('./staging/public'));
}

function publishHtml() {
	return gulp
		.src('./build/public/**/*.html')
		.pipe(gulp.dest('./staging/public'));
}

function publishImages() {
	return gulp
		.src('./build/public/**/*.{png,jpg,svg}')
		.pipe(gulp.dest('./staging/public'));
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

const buildPortfolio = gulp.series(
  cleanBuild,
  appBuild.buildProjectImages,
  copyDynamicBuild,
  buildServerJs,
  buildStaticProjects);

const publishPortfolio = gulp.series(
  buildPortfolio,
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
		'nfsn signal-daemon Node hup'
	]);

const stageSite = gulp.series(buildStatic, publishToStaging);
const deploy = gulp.series(stageSite, updateServerPackages);

module.exports.deploy = deploy;
module.exports.buildStatic = buildStatic;
module.exports.stageSite = stageSite;
module.exports.publishBiography = publishBiography;
module.exports.publishResume = publishResume;
module.exports.publishPortfolio = publishPortfolio;
module.exports.buildPortfolio = buildPortfolio;

