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

// Bundle JS/JSX
var jsBundler = watchify(browserify('./views/index.jsx', { cache: {}, packageCache: {}, "extensions": ".jsx" }));
// add any other browserify options or transforms here
jsBundler.transform(reactify);

function bundleJs() {

	return jsBundler.bundle()
		// log errors if they happen
		.on('error', gutil.log.bind(gutil, 'Browserify Error'))
		.pipe(source('client.js'))
		// optional, remove if you dont want sourcemaps
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
		.pipe(uglify())
		.pipe(sourcemaps.write('./')) // writes .map file
		.pipe(gulp.dest('./public/js'));
}

jsBundler.on('update', function() {
	console.log('Build updated!');
	bundleJs();
}); // on any dep update, runs the bundler

gulp.task('clean-js', function(cb) {
	del(['./public/js'], cb);
});

gulp.task('react', ['clean-js'], bundleJs); // so you can run `gulp js` to build the file

gulp.task('clean-css', function(cb) {
	del(['./public/css'], cb);
});

// Bundle LESS
gulp.task('less', ['clean-css'], function () {
  return gulp.src('./views/index.less')
	.pipe(less())
	// this (and everything else publicly served) should be changed to "public"
	// in the future
	// .pipe(source('layout.css'))
	.pipe(minifyCss())
    .pipe(gulp.dest('./public/css'));
});

gulp.task('clean-images', function(cb) {
	del(['./public/images'], cb);
});

gulp.task('images', ['clean-images'], function () {
	// Just copy images for now, may compress/resize later
	return gulp.src('./imgs/*')
		.pipe(gulp.dest('public/imgs'));
});

gulp.task('build', ['images', 'less', 'react']);

gulp.task('watch', ['build'], function() {
	gulp.watch('./imgs/**/*', ['images']);

	gulp.watch('./views/**/*.less', ['less']);
});
