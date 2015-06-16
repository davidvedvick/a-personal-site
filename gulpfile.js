var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var reactify = require('reactify');
//var del = require('del');

var bundler = watchify(browserify('./views/index.jsx', { cache: {}, packageCache: {}, "extensions": ".jsx" }));
// add any other browserify options or transforms here
bundler.transform(reactify);

gulp.task('js', bundle); // so you can run `gulp js` to build the file
bundler.on('update', function() {
	console.log('Build updated!');
	bundle();
}); // on any dep update, runs the bundler

const outputDir = './js';


function bundle() {
//	del([outputDir], { force: true },
//		function(err) {
//			if (err) return;
			return bundler.bundle()
				// log errors if they happen
				.on('error', gutil.log.bind(gutil, 'Browserify Error'))
				.pipe(source('client.js'))
				// optional, remove if you dont want sourcemaps
				  .pipe(buffer())
				  .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
				  .pipe(sourcemaps.write('./')) // writes .map file
				//
				.pipe(gulp.dest(outputDir));
//		}
//	);
}
