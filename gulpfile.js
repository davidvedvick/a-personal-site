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

// Bundle JS/JSX
// var jsBundler = watchify(browserify('./views/project/project-list.jsx', { cache: {}, packageCache: {}, "extensions": ".jsx" }));
// // add any other browserify options or transforms here
// jsBundler
// 	.transform(reactify)
// 	.on('update', function() {
// 		gutil.log('React build updated');
// 		bundleJs();
// 	}); // on any dep update, runs the bundler
//
// jsBundler
// 	.on('update', function() {
// 		gutil.log('Client JS build updated');
// 		bundleJs();
// 	}); // on any dep update, runs the bundler
//
// function bundleJs() {
//
// 	return jsBundler.bundle()
// 		// log errors if they happen
// 		.on('error', gutil.log.bind(gutil, 'Browserify Error'))
// 		.pipe(source('client.js'))
// 		// optional, remove if you dont want sourcemaps
// 		.pipe(buffer())
// 		.pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
// 		.pipe(uglify())
// 		.pipe(sourcemaps.write('./')) // writes .map file
// 		.pipe(gulp.dest('./public/js'));
// }

gulp.task('clean-js', function(cb) {
	del(['./public/js'], cb);
});

gulp.task('client-js', ['clean-js'], function () {
	const destDir = './public/js';
	return gulp.src("./views/*/*.client.js")
		.pipe(changed(destDir))
		.pipe(through2.obj(function (file, enc, next){
			browserify(file.path)
				.bundle(function(err, res){
				// assumes file.contents is a Buffer
				file.contents = res;
				next(null, file);
			});
		}))
		.pipe(uglify())
		.pipe(rename({ dirname: "" }))
		.pipe(gulp.dest(destDir));
});

// gulp.task('react', ['clean-js'], bundleJs); // so you can run `gulp js` to build the file

gulp.task('clean-css', function(cb) {
	del(['./public/css'], cb);
});

// copy slick carousel blobs
gulp.task('slick-blobs', ['clean-css'], function() {
	return gulp.src(['./node_modules/slick-carousel/slick/**/*.{woff,tff,gif,jpg,png}']).pipe(gulp.dest('./public/css'));
});

// Bundle LESS
gulp.task('less', ['clean-css'], function () {
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
	gulp.watch('./views/**/*.client.js', ['client-js']);
});
