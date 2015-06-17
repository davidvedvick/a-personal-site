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

// Bundle JS/JSX
var jsBundler = watchify(browserify('./views/index.jsx', { cache: {}, packageCache: {}, "extensions": ".jsx" }));
// add any other browserify options or transforms here
jsBundler
	.transform(reactify)
	.on('update', function() {
		console.log('Build updated!');
		bundleJs();
	}); // on any dep update, runs the bundler

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

gulp.task('clean-js', function(cb) {
	del(['./public/js'], cb);
});

gulp.task('react', ['clean-js'], bundleJs); // so you can run `gulp js` to build the file

// copy slick carousel blobs
gulp.task('slick-blobs', ['clean-css'], function() {
	return gulp.src(['./node_modules/slick-carousel/slick/**/*.{woff,tff,gif,jpg,png}']).pipe(gulp.dest('./public/css'));
});

gulp.task('clean-css', function(cb) {
	del(['./public/css'], cb);
});

// Bundle LESS
gulp.task('less', ['clean-css'], function () {
  return gulp.src('./views/index.less')
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
	// Just copy images for now, may compress/resize later
	return gulp.src('./projects/**/imgs/*')
			.pipe(gulp.dest('./public/imgs/projects'));
});

gulp.task('build', ['images', 'project-images', 'less', 'react', 'slick-blobs']);

gulp.task('watch', ['build'], function() {
	gulp.watch('./imgs/**/*', ['images']);
	gulp.watch('./projects/**/imgs/*', ['project-images']);
	gulp.watch('./views/**/*.less', ['less']);
});
