const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const browserify = require('browserify');
const terser = require('gulp-terser');
const sass = require('gulp-sass');
const cssnano = require('gulp-cssnano');
const del = require('del');
const through2 = require('through2');
const rename = require('gulp-rename');
const parallel = require('concurrent-transform');
const changed = require('gulp-changed');
const imageResize = require('gulp-image-resize');
const os = require('os');
const appConfig = require('./app-config.json');
const markdownPdf = require('gulp-markdown-pdf');
const path = require('path');

var production = false;

var outputDir = __dirname;
const getOutputDir = (relativeDir) => path.join(outputDir, relativeDir || '');
const getInputDir = (relativeDir) => path.join(__dirname, relativeDir || '');
const nodeModuleDir = path.join(__dirname, '../node_modules');

const numberOfCpus = os.cpus().length;

// Dynamic build content

function clean() {
	return del([
		getOutputDir('public/js'),
		getOutputDir('public/css'),
		getOutputDir('public/images')]);
}

function buildJs() {
	const destDir = getOutputDir('public/js');

	var pipe = gulp.src(getInputDir('views/**/*.client.{js,jsx}'))
		.pipe(parallel(
			through2.obj((file, enc, next) =>
				browserify(file.path, { extensions: '.jsx', debug: !production })
					.transform('babelify', { presets: [ ['@babel/preset-env', {
						"targets": {
							"browsers": [
								"last 2 versions"
							]
						}
					}], '@babel/preset-react' ] })
					.bundle((err, res) => {
						if (err) console.log(err);
						// assumes file.contents is a Buffer
						else file.contents = res;

						next(null, file);
					})),
			numberOfCpus))
		.pipe(rename({
			dirname: '',
			extname: '.js'
		}));

	pipe = production
		? pipe.pipe(parallel(terser(), numberOfCpus))
		: pipe
			.pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
			.pipe(sourcemaps.write(getOutputDir())); // writes .map file

	return pipe.pipe(gulp.dest(destDir));
};

// copy slick carousel blobs
function collectSlickBlobs() {
	return gulp
		.src([`${nodeModuleDir}/slick-carousel/slick/**/*.{woff,tff,gif,jpg,png}`])
		.pipe(gulp.dest(getOutputDir('public/css')));
}

const npmSassAliases = {};
/**
* Will look for .scss|sass files inside the node_modules folder
*/
function npmSassResolver(url, file, done) {
	// check if the path was already found and cached
	if(npmSassAliases[url]) {
		return done({ file: npmSassAliases[url] });
	}

	// look for modules installed through npm
	try {
		const newPath = require.resolve(url);
		npmSassAliases[url] = newPath; // cache this request
		return done({ file: newPath });
	} catch(e) {
		// if your module could not be found, just return the original url
		npmSassAliases[url] = url;
		return done({ file: url });
	}
}

// Bundle SASS
function transformSass() {
	return gulp.src(getInputDir('views/layout.scss'))
			.pipe(sass({ importer: npmSassResolver }).on('error', sass.logError))
			.pipe(cssnano())
			.pipe(gulp.dest(getOutputDir('public/css')));
}

const buildCss = gulp.series(collectSlickBlobs, transformSass);

function buildPublicImages() {
	return gulp.src(getInputDir('imgs/*')).pipe(gulp.dest(getOutputDir('public/imgs')));
}

function buildProfileImage() {
	return gulp
		.src(appConfig.bio.authorPicture)
		.pipe(imageResize({ width: 500 }))
		.pipe(rename('profile-picture.jpg'))
		.pipe(gulp.dest(getOutputDir('public/imgs')));
}

function buildProjectImages() {
	const destDir = getOutputDir('public/imgs/projects');
	return gulp.src(getInputDir('content/projects/**/imgs/*'))
			.pipe(changed(destDir))
			.pipe(parallel(
				imageResize({ height: 300 }),
				os.cpus().length
			))
			.pipe(gulp.dest(destDir));
}

buildImages = gulp.parallel(buildPublicImages, buildProjectImages, buildProfileImage);

function buildResumePdf() {
	return gulp
		.src(appConfig.resumeLocation)
		.pipe(markdownPdf({
			remarkable: { html: true, breaks: false },
			cssPath: getOutputDir('public/css/layout.css'),
			paperFormat: 'Letter'
		}))
		.pipe(rename({
			extname: '.pdf'
		}))
		.pipe(gulp.dest(getOutputDir('public')));
}

const buildSite = gulp.series(
	clean,
	gulp.parallel(
		buildJs,
		gulp.series(buildCss, buildResumePdf),
		buildImages));

// gulp.task('watch', ['build'], () => {
// 	gulp.watch('./views/**/*.scss', ['sass']);
// 	gulp.watch('./imgs/**/*', ['images']);
// 	gulp.watch(appConfig.projectLocation + '/**/imgs/*', ['project-images']);
// 	gulp.watch('./views/**/*.client.{js,jsx}', ['client-js']);
// 	gulp.watch(appConfig.resumeLocation, ['build-resume-pdf']);
// });

module.exports = function(options) {
	production = options.production || production;
	outputDir = options.outputDir || outputDir;

	return {
		build: buildSite,
		buildImages: buildImages
	};
};

module.exports.default = buildSite;
