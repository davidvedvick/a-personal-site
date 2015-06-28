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
var gulpSsh = require('gulp-ssh')({
	ignoreErrors: false,
	// set this from a config file
	sshConfig: require('./ssh-config.json')
});

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

var rawMarkdown = {};

var jsxToHtml = function(options) {
	return through2.obj(function (file, enc, cb) {

		require('node-jsx').install({extension: '.jsx'});
		var component = require(file.path);
		component = component.default || component;
		var markup = '<!doctype html>' + React.renderToStaticMarkup(React.createElement(component, options));
		file.contents = new Buffer(markup);
		file.path = gutil.replaceExtension(file.path, '.html');

		this.push(file);

		cb();
	});
};

var hashDest = function(dest, opts) {
	return through2.obj(function (file, enc, cb) {
		opts = opts || {};

		dest[file.path.replace(file.base, '')] = opts.onStore ? opts.onStore(file.contents) : file.contents.toString(opts.enc || enc);
		cb();
	});
};

gulp.task('store-resume-markdown', function() {
	return gulp
		.src('./content/resume.md')
		.pipe(hashDest(rawMarkdown));
});

gulp.task('build-static-resume', ['build', 'store-resume-markdown'], function() {
	return gulp
		.src('./views/resume/resume.jsx')
		.pipe(jsxToHtml({resume: rawMarkdown['resume.md']}))
		.pipe(gulp.dest('./public/html'));
});

gulp.task('store-bio-markdown', function() {
	return gulp
		.src('./content/bio.md')
		.pipe(hashDest(rawMarkdown));
});

gulp.task('build-static-index', ['build', 'store-bio-markdown'], function() {
	return gulp
		.src('./views/index/index.jsx')
		.pipe(jsxToHtml({bio: rawMarkdown['bio.md']}))
		.pipe(gulp.dest('./public/html'));
});

var projectMarkdown = {};
gulp.task('store-project-markdown', function() {
	return gulp
		.src('./content/projects/*/features.md')
		.pipe(hashDest(projectMarkdown));
});

var projectData = {};
gulp.task('store-project-json', ['store-project-markdown'], function() {
	return gulp
		.src('./content/projects/projects.json')
		.pipe(hashDest(projectData, {
			onStore: function(data) {
				var projects = JSON.parse(data);

				projects.forEach(function(project) {
					project.features = projectMarkdown[project.name + '/features.md'];
				});

				return projects;
			}
		}));
});

gulp.task('build-static-projects', ['build', 'store-project-json'], function() {
	return gulp
		.src('./views/project/project-list.jsx')
		.pipe(jsxToHtml({projects: projectData['projects.json']}))
		.pipe(gulp.dest('./public/html'));
});

gulp.task('build-static', ['build', 'build-static-resume', 'build-static-index', 'build-static-projects']);

gulp.task('publish-request-handlers', ['build-static'], function() {
	return gulp
		.src(['./request-handlers/**/*.js'])
		.pipe(gulpSsh.dest('/home/protected/app/request-handlers/'));
});

gulp.task('publish-app', ['build-static', 'publish-request-handlers'], function() {
	return gulp
		.src(['./app-release.js', './start-server.sh', './package.json'])
		.pipe(gulpSsh.dest('/home/protected/app/'));
});

gulp.task('publish-content', ['build-static'], function() {
	return gulp
		.src('./public/**/*')
		.pipe(gulpSsh.dest('/home/protected/app/public/'));
});

gulp.task('publish-jsx', function() {
	return gulp
		.src('./views/**/*.jsx')
		.pipe(gulpSsh.dest('/home/protected/app/views/'));
});

gulp.task('update-server', ['publish-app', 'publish-content', 'publish-jsx'], function() {
	return gulpSsh.shell(['cd /home/protected/app/', 'npm install', 'npm update', 'chmod +x start-server.sh']);
});

gulp.task('deploy', ['publish-app', 'publish-content', 'publish-jsx', 'update-server']);
