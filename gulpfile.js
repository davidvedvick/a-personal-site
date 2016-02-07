var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var babelify = require('babelify');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var cssnano = require('gulp-cssnano');
var del = require('del');
var through2 = require('through2');
var rename = require('gulp-rename');
var parallel = require('concurrent-transform');
var changed = require('gulp-changed');
var imageResize = require('gulp-image-resize');
var os = require('os');
var React = require('react');
var appConfig = require('./app-config.json');
var path = require('path');
var markdownPdf = require('gulp-markdown-pdf');
var gulpSsh = require('gulp-ssh')({
	ignoreErrors: false,
	// set this from a config file
	sshConfig: require('./ssh-config.json')
});
var htmlmin = require('gulp-htmlmin');

var production = false;

gulp.task('clean-js', function (cb) {
	del(['./public/js']).then(() => { cb(); });
});

gulp.task('client-js', ['clean-js'], function () {
	const destDir = './public/js';

	var pipe = gulp.src('./views/**/*.client.{js,jsx}')
		.pipe(parallel(
			through2.obj(function (file, enc, next) {
				browserify(file.path, { extensions: '.jsx', debug: !production })
					.transform(babelify, { presets: ['es2015', 'react']})
					.bundle(function (err, res) {
						if (err) console.log(err);
						// assumes file.contents is a Buffer
						else file.contents = res;

						next(null, file);
					});
			})),
			os.cpus().length
		)
		.pipe(rename({
			dirname: '',
			extname: '.js'
		}));

	if (!production) {
		pipe = pipe
				.pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
				.pipe(sourcemaps.write('./')); // writes .map file
	} else {
		pipe = pipe.pipe(parallel(uglify(), os.cpus().length));
	}

	return pipe.pipe(gulp.dest(destDir));
});

gulp.task('clean-css', function (cb) {
	del(['./public/css']).then(() => { cb(); });
});

// copy slick carousel blobs
gulp.task('slick-blobs', ['clean-css'], function () {
	return gulp.src(['./node_modules/slick-carousel/slick/**/*.{woff,tff,gif,jpg,png}']).pipe(gulp.dest('./public/css'));
});

// Bundle LESS
gulp.task('less', ['clean-css', 'slick-blobs'], function () {
	return gulp.src('./views/layout.less')
		.pipe(less({ paths: ['./node_modules'] }))
		.pipe(cssnano())
		.pipe(gulp.dest('./public/css'));
});

gulp.task('clean-images', function (cb) {
	del(['./public/images']).then(() => { cb(); });
});

gulp.task('images', ['clean-images'], function () {
	return gulp.src('./imgs/*').pipe(gulp.dest('./public/imgs'));
});

gulp.task('profile-image', ['clean-images'], function () {
	return gulp
		.src(appConfig.bio.authorPicture)
		.pipe(imageResize({ width: 500 }))
		.pipe(rename('profile-picture.jpg'))
		.pipe(gulp.dest('./public/imgs'));
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

gulp.task('build-resume-pdf', function () {
	return gulp
		.src(appConfig.resumeLocation)
		.pipe(markdownPdf())
		.pipe(rename({
			extname: '.pdf'
		}))
		.pipe(gulp.dest('./public'));
});

gulp.task('build', ['images', 'project-images', 'profile-image', 'less', 'client-js', 'slick-blobs', 'build-resume-pdf']);

gulp.task('watch', ['build'], function () {
	gulp.watch('./views/**/*.less', ['less']);
	gulp.watch('./imgs/**/*', ['images']);
	gulp.watch(appConfig.projectLocation + '/**/imgs/*', ['project-images']);
	gulp.watch('./views/**/*.client.{js,jsx}', ['client-js']);
	gulp.watch(appConfig.resumeLocation, ['build-resume-pdf']);
});

var rawMarkdown = {};

var jsxToHtml = function (options) {
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

var hashDest = function (dest, opts) {
	return through2.obj(function (file, enc, cb) {
		opts = opts || {};

		dest[file.path.replace(file.base, '')] = opts.onStore ? opts.onStore(file.contents) : file.contents.toString(opts.enc || enc);
		cb();
	});
};

gulp.task('store-resume-markdown', function () {
	return gulp
		.src(appConfig.resumeLocation)
		.pipe(hashDest(rawMarkdown));
});

gulp.task('build-static-resume', ['build', 'store-resume-markdown'], function () {
	return gulp
		.src('./views/resume/resume.jsx')
		.pipe(jsxToHtml({resume: rawMarkdown['resume.md']}))
		.pipe(htmlmin())
		.pipe(gulp.dest('./public/html'));
});

gulp.task('store-bio-markdown', function () {
	return gulp
		.src(appConfig.bio.path)
		.pipe(hashDest(rawMarkdown));
});

gulp.task('build-static-index', ['build', 'store-bio-markdown'], function () {
	return gulp
		.src('./views/index/index.jsx')
		.pipe(jsxToHtml({bio: rawMarkdown['bio.md']}))
		.pipe(htmlmin())
		.pipe(gulp.dest('./public/html'));
});

var projectMarkdown = {};
gulp.task('store-project-markdown', function () {
	return gulp
		.src(path.join(appConfig.projectsLocation, '*/features.md'))
		.pipe(hashDest(projectMarkdown));
});

var projectData = {};
gulp.task('store-project-json', ['store-project-markdown'], function () {
	return gulp
		.src(path.join(appConfig.projectsLocation, 'projects.json'))
		.pipe(hashDest(projectData, {
			onStore: function (data) {
				var projects = JSON.parse(data);

				projects.forEach(function (project) {
					project.features = projectMarkdown[project.name + '/features.md'];
				});

				return projects;
			}
		}));
});

gulp.task('build-static-projects', ['build', 'store-project-json'], function () {
	return gulp
		.src('./views/project/project-list.jsx')
		.pipe(jsxToHtml({projects: projectData['projects.json']}))
		.pipe(htmlmin())
		.pipe(gulp.dest('./public/html'));
});

gulp.task('build-static', ['build', 'build-static-resume', 'build-static-index', 'build-static-projects']);

gulp.task('set-publish-vars', function (cb) {
	production = true;
	cb();
});

gulp.task('publish-request-handlers', ['build-static'], function () {
	return gulp
		.src(['./request-handlers/**/*.js'])
		.pipe(gulpSsh.dest('/home/protected/app/request-handlers/'));
});

gulp.task('publish-app', ['set-publish-vars', 'build-static', 'publish-request-handlers'], function () {
	return gulp
		.src(['./app-release.js', './start-server.sh', './package.json'])
		.pipe(gulpSsh.dest('/home/protected/app/'));
});

gulp.task('publish-content', ['set-publish-vars', 'build-static'], function () {
	return gulp
		.src('./public/**/*')
		.pipe(gulpSsh.dest('/home/protected/app/public/'));
});

gulp.task('publish-jsx', ['set-publish-vars'], function () {
	return gulp
		.src('./views/**/*.jsx')
		.pipe(gulpSsh.dest('/home/protected/app/views/'));
});

gulp.task('publish', ['set-publish-vars', 'publish-app', 'publish-content', 'publish-jsx']);

gulp.task('update-server', ['publish'], function () {
	// uninstall all the packages: `npm ls -p --depth=0 | awk -F/node_modules/ '{print $2}' | grep -vE '^(npm|)$' | xargs -r npm uninstall`
	return gulpSsh.shell([
		'cd /home/protected/app/',
		'chmod +x start-server.sh',
		'npm install --production',
		'npm prune --production',
		'npm dedupe',
		'rm -rf /home/tmp/npm*',
		'npm cache clean'
	]);
});

gulp.task('deploy', ['publish', 'update-server']);
