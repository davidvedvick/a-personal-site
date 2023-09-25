const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const browserify = require('browserify');
const terser = require('gulp-terser');
const cleanCss = require('gulp-clean-css');
const del = require('del');
const through2 = require('through2');
const rename = require('gulp-rename');
const parallel = require('concurrent-transform');
const changed = require('gulp-changed');
const imageResize = require('gulp-image-resize');
const os = require('os');
const appConfig = require('./app-config.json');
const path = require('path');
const envify = require('envify');
const { mdToPdf } = require('md-to-pdf');

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

const sass = require('gulp-sass')(require('sass'));

const deSassify = () => sass(
	{
		importer: npmSassResolver
	}).on('error', sass.logError);

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
					.transform(envify)
					.transform('babelify', {
						presets: [ 
							[
								'@babel/preset-env', {
									"targets": {
										"browsers": [
											"last 2 versions"
										]
									}
								}
							],
							'@babel/preset-react',
						],
						plugins: [ '@babel/transform-runtime' ]
					})
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
		? pipe.pipe(parallel(terser({ compress: { passes: 2, unsafe: true } }), numberOfCpus))
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

// Bundle SASS
function transformSass() {
	return gulp.src(getInputDir('views/layout.scss'))
			.pipe(deSassify())
			.pipe(cleanCss())
			.pipe(gulp.dest(getOutputDir('public/css')));
}

const buildCss = gulp.parallel(collectSlickBlobs, transformSass);

function buildPublicImages() {
	return gulp.src(getInputDir('imgs/*')).pipe(gulp.dest(getOutputDir('public/imgs')));
}

function copyPublicFonts() {
	return gulp.src(getInputDir('fonts/*')).pipe(gulp.dest(getOutputDir('public/fonts')));
}

function buildProfileImage() {
	return gulp
		.src(appConfig.bio.authorPicture)
		.pipe(imageResize({ width: 500 }))
		.pipe(rename('profile-picture.jpg'))
		.pipe(gulp.dest(getOutputDir('public/imgs')));
}

function buildProjectImages() {
	const destDir = getOutputDir('public/content/projects');
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
	const resumeLocation = appConfig.resumeLocation;
	const fileName = path.basename(resumeLocation, "md");

	return mdToPdf(
		{ path: resumeLocation },
		{
			dest: path.join(getOutputDir('public'), fileName) + "pdf",
			pdf_options: {
				format: 'Letter',
			}
		}
	);
}

const buildSite = gulp.series(
	clean,
	gulp.parallel(
		buildJs,
		gulp.series(buildCss, buildResumePdf),
		buildImages,
		copyPublicFonts));

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
		buildImages: gulp.series(clean, buildImages),
		copyPublicFonts: copyPublicFonts,
		buildResumePdf: gulp.series(clean, buildCss, buildResumePdf)
	};
};

module.exports.default = buildSite;
