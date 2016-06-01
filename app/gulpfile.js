const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const browserify = require('browserify');
const babelify = require('babelify');
const uglify = require('gulp-uglify');
const less = require('gulp-less');
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

var outputDir = './';
const getOutputDir = (relativeDir) => path.join(outputDir, relativeDir || '');

const numberOfCpus = os.cpus().length;

// Dynamic build content

gulp.task('clean-js', (cb) => { del([getOutputDir('public/js')]).then(() => cb()); });

gulp.task('client-js', ['clean-js'], () => {
	const destDir = getOutputDir('public/js');

	var pipe = gulp.src('./views/**/*.client.{js,jsx}')
		.pipe(parallel(
			through2.obj((file, enc, next) =>
				browserify(file.path, { extensions: '.jsx', debug: !production })
					.transform(babelify, { presets: [ 'es2015', 'react' ] })
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
		? pipe.pipe(parallel(uglify(), numberOfCpus))
		: pipe
			.pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
			.pipe(sourcemaps.write(getOutputDir())); // writes .map file

	return pipe.pipe(gulp.dest(destDir));
});

gulp.task('clean-css', function (cb) {
	del([getOutputDir('public/css')]).then(() => { cb(); });
});

// copy slick carousel blobs
gulp.task('slick-blobs', ['clean-css'], () =>
	gulp.src(['../node_modules/slick-carousel/slick/**/*.{woff,tff,gif,jpg,png}']).pipe(gulp.dest(getOutputDir('public/css'))));

// Bundle LESS
gulp.task('less', ['clean-css', 'slick-blobs'],
	() =>
		gulp.src('./views/layout.less')
			.pipe(less({ paths: ['../node_modules'] }))
			.pipe(cssnano())
			.pipe(gulp.dest(getOutputDir('public/css'))));

gulp.task('clean-images', (cb) => { del([getOutputDir('./public/images')]).then(() => cb()); });

gulp.task('images', ['clean-images'], () => gulp.src('./imgs/*').pipe(gulp.dest(getOutputDir('public/imgs'))));

gulp.task('profile-image', ['clean-images'],
	() =>
		gulp
			.src(appConfig.bio.authorPicture)
			.pipe(imageResize({ width: 500 }))
			.pipe(rename('profile-picture.jpg'))
			.pipe(gulp.dest(getOutputDir('public/imgs'))));

gulp.task('project-images', () => {
	const destDir = getOutputDir('public/imgs/projects');
	return gulp.src('./content/projects/**/imgs/*')
			.pipe(changed(destDir))
			.pipe(parallel(
				imageResize({ height: 300 }),
				os.cpus().length
			))
			.pipe(gulp.dest(destDir));
});

gulp.task('build-resume-pdf',
	() =>
		gulp
			.src(appConfig.resumeLocation)
			.pipe(markdownPdf())
			.pipe(rename({
				extname: '.pdf'
			}))
			.pipe(gulp.dest(getOutputDir('public'))));

gulp.task('build', ['images', 'project-images', 'profile-image', 'less', 'client-js', 'slick-blobs', 'build-resume-pdf']);

gulp.task('watch', ['build'], () => {
	gulp.watch('./views/**/*.less', ['less']);
	gulp.watch('./imgs/**/*', ['images']);
	gulp.watch(appConfig.projectLocation + '/**/imgs/*', ['project-images']);
	gulp.watch('./views/**/*.client.{js,jsx}', ['client-js']);
	gulp.watch(appConfig.resumeLocation, ['build-resume-pdf']);
});

module.exports = (options) => {
	production = options.production;
	outputDir = options.outputDir;
};
