var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var reactify = require('reactify');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var watch = require('gulp-watch');
var del = require('del');
var concat = require('gulp-concat');
var transform = require('vinyl-transform');
var globby = require('globby');
var through2 = require('through2');
var streamify = require('gulp-streamify');
var rename = require('gulp-rename');
var parallel = require('concurrent-transform');
var changed = require('gulp-changed');
var imageResize = require('gulp-image-resize');
var os = require('os');
var React = require('react');

gulp.task('clean-js', function(cb) {
	del(['./public/js'], cb);
});

gulp.task('client-js', ['clean-js'], function () {
	const destDir = './public/js';
	return gulp.src('./views/*/*.client.{js,jsx}')
		.pipe(parallel(
			through2.obj(function (file, enc, next) {
				browserify(file.path, { extensions: '.jsx' })
					.transform(reactify)
					.bundle(function(err, res){
						if (err)
							console.log(err);
						// assumes file.contents is a Buffer
						else
							file.contents = res;

						next(null, file);
					});
			})),
			os.cpus().length
		)
		.pipe(rename({
			dirname: '',
			extname: '.js'
		}))
		.pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
		.pipe(parallel(uglify(), os.cpus().length))
		.pipe(sourcemaps.write('./')) // writes .map file
		.pipe(gulp.dest(destDir));
});

gulp.task('clean-css', function(cb) {
	del(['./public/css'], cb);
});

// copy slick carousel blobs
gulp.task('slick-blobs', ['clean-css'], function() {
	return gulp.src(['./node_modules/slick-carousel/slick/**/*.{woff,tff,gif,jpg,png}']).pipe(gulp.dest('./public/css'));
});

// Bundle LESS
gulp.task('less', ['clean-css', 'slick-blobs'], function () {
  return gulp.src('./views/layout.less')
	.pipe(less({ paths: ["./node_modules"] }))
	// .pipe(minifyCss())
    .pipe(gulp.dest('./public/css'));
});

gulp.task('clean-images', function(cb) {
	del(['./public/images'], cb);
});

gulp.task('images', ['clean-images'], function () {
	// Just copy images for now, may compress/resize later
	return gulp.src('./imgs/*').pipe(gulp.dest('./public/imgs'));
});

gulp.task('project-images', function () {
	const destDir = './public/imgs/projects';
	return gulp.src('./content/projects/**/imgs/*')
			.pipe(changed(destDir))
			.pipe(parallel(
				imageResize({ height: 300 }),
				os.cpus().length
			))
			.pipe(gulp.dest(destDir));
});

gulp.task('build', ['images', 'project-images', 'less', 'client-js', 'slick-blobs']);

gulp.task('watch', ['build'], function() {
	gulp.watch('./views/**/*.less', ['less']);
	gulp.watch('./imgs/**/*', ['images']);
	gulp.watch('./content/projects/**/imgs/*', ['project-images']);
	gulp.watch('./views/**/*.client.{js,jsx}', ['client-js']);
});

var jsxToHtml = function(options) {
	return through2.obj(function (file, enc, cb) {
		options = options || {};

		require('node-jsx').install({extension: '.jsx'});
		var component = require(file.path);
		component = component.default || component;
		var markup = React.renderToStaticMarkup(React.createElement(component, options));
		file.contents = new Buffer(markup);
		file.path = gutil.replaceExtension(file.path, '.html');

		this.push(file);
	});
};

gulp.task('build-static-resume', ['build'], function() {
	return gulp
		.src('./views/resume/resume.jsx')
		.pipe(jsxToHtml())
		.pipe(gulp.dest('./public/html'));
});

gulp.task('build-static-index', ['build'], function() {
	return gulp
		.src('./views/resume/resume.jsx')
		.pipe(jsxToHtml())
		.pipe(gulp.dest('./public/html'));
});

gulp.task('build-static', ['build', 'build-static-resume'], function() {
});
