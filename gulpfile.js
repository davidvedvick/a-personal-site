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
var jsBundler = browserify('./views/index.jsx', { cache: {}, packageCache: {}, "extensions": ".jsx" });
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
		.pipe(gulp.dest('./js'));
}
//
// jsBundler.on('update', function() {
// 	console.log('Build updated!');
// 	bundleJs();
// }); // on any dep update, runs the bundler

gulp.task('react', bundleJs); // so you can run `gulp js` to build the file

// Bundle LESS
gulp.task('less', function () {
  return gulp.src('./views/index.less')
	.pipe(less())
	// this (and everything else publicly served) should be changed to "public"
	// in the future
	// .pipe(source('layout.css'))
	.pipe(minifyCss())
    .pipe(gulp.dest('./css'));
});

gulp.task('clean', function(cb) {
	del(['./css','./js'], cb);
});

gulp.task('watch', ['clean', 'less', 'react'], function() {
	gulp.watch('./views/**/*.less', ['less']);

	gulp.watch('./views/**/*.jsx', ['react']);
});
