const gulp = require('gulp');
const gutil = require('gulp-util');
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
const React = require('react');
const appConfig = require('./app-config.json');
const path = require('path');
const markdownPdf = require('gulp-markdown-pdf');
const gulpSsh = require('gulp-ssh')({
	ignoreErrors: false,
	// set this from a config file
	sshConfig: require('./ssh-config.json')
});
const htmlmin = require('gulp-htmlmin');

var production = false;

gulp.task('clean-js', (cb) => { del(['./public/js']).then(() => cb()); });

gulp.task('client-js', ['clean-js'], () => {
	const destDir = './public/js';

	var pipe = gulp.src('./views/**/*.client.{js,jsx}')
		.pipe(parallel(
			through2.obj(function (file, enc, next) {
				browserify(file.path, { extensions: '.jsx', debug: !production })
					.transform(babelify, { presets: ['es2015', 'react'] })
					.bundle((err, res) => {
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

	pipe = production
		? pipe.pipe(parallel(uglify(), os.cpus().length))
		: pipe
			.pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
			.pipe(sourcemaps.write('./')); // writes .map file

	return pipe.pipe(gulp.dest(destDir));
});

gulp.task('clean-css', function (cb) {
	del(['./public/css']).then(() => { cb(); });
});

// copy slick carousel blobs
gulp.task('slick-blobs', ['clean-css'], () =>
	gulp.src(['./node_modules/slick-carousel/slick/**/*.{woff,tff,gif,jpg,png}']).pipe(gulp.dest('./public/css')));

// Bundle LESS
gulp.task('less', ['clean-css', 'slick-blobs'],
	() =>
		gulp.src('./views/layout.less')
			.pipe(less({ paths: ['./node_modules'] }))
			.pipe(cssnano())
			.pipe(gulp.dest('./public/css')));

gulp.task('clean-images', (cb) => { del(['./public/images']).then(() => cb()); });

gulp.task('images', ['clean-images'], () => gulp.src('./imgs/*').pipe(gulp.dest('./public/imgs')));

gulp.task('profile-image', ['clean-images'],
	() =>
		gulp
			.src(appConfig.bio.authorPicture)
			.pipe(imageResize({ width: 500 }))
			.pipe(rename('profile-picture.jpg'))
			.pipe(gulp.dest('./public/imgs')));

gulp.task('project-images', () => {
	const destDir = './public/imgs/projects';
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
			.pipe(gulp.dest('./public')));

gulp.task('build', ['images', 'project-images', 'profile-image', 'less', 'client-js', 'slick-blobs', 'build-resume-pdf']);

gulp.task('watch', ['build'], () => {
	gulp.watch('./views/**/*.less', ['less']);
	gulp.watch('./imgs/**/*', ['images']);
	gulp.watch(appConfig.projectLocation + '/**/imgs/*', ['project-images']);
	gulp.watch('./views/**/*.client.{js,jsx}', ['client-js']);
	gulp.watch(appConfig.resumeLocation, ['build-resume-pdf']);
});

var rawMarkdown = {};

var jsxToHtml = (options) =>
	through2.obj((file, enc, cb) => {
		require('node-jsx').install({extension: '.jsx'});
		var component = require(file.path);
		component = component.default || component;
		const markup = '<!doctype html>' + React.renderToStaticMarkup(React.createElement(component, options));
		file.contents = new Buffer(markup);
		file.path = gutil.replaceExtension(file.path, '.html');

		this.push(file);

		cb();
	});

var hashDest = (dest, opts) =>
	through2.obj((file, enc, cb) => {
		opts = opts || {};

		dest[file.path.replace(file.base, '')] = opts.onStore ? opts.onStore(file.contents) : file.contents.toString(opts.enc || enc);
		cb();
	});

gulp.task('store-resume-markdown',
	() =>
		gulp
			.src(appConfig.resumeLocation)
			.pipe(hashDest(rawMarkdown)));

gulp.task('build-static-resume', ['build', 'store-resume-markdown'],
	() =>
		gulp
			.src('./views/resume/resume.jsx')
			.pipe(jsxToHtml({resume: rawMarkdown['resume.md']}))
			.pipe(htmlmin())
			.pipe(gulp.dest('./public/html')));

gulp.task('store-bio-markdown',
	() =>
		gulp
			.src(appConfig.bio.path)
			.pipe(hashDest(rawMarkdown)));

gulp.task('build-static-index', ['build', 'store-bio-markdown'],
	() =>
		gulp
			.src('./views/index/index.jsx')
			.pipe(jsxToHtml({bio: rawMarkdown['bio.md']}))
			.pipe(htmlmin())
			.pipe(gulp.dest('./public/html')));

var projectMarkdown = {};
gulp.task('store-project-markdown',
	() =>
		gulp
			.src(path.join(appConfig.projectsLocation, '*/features.md'))
			.pipe(hashDest(projectMarkdown)));

var projectData = {};
gulp.task('store-project-json', ['store-project-markdown'],
	() =>
		gulp
			.src(path.join(appConfig.projectsLocation, 'projects.json'))
			.pipe(hashDest(projectData, {
				onStore: (data) => {
					const projects = JSON.parse(data);

					projects.forEach((project) => {
						project.features = projectMarkdown[project.name + '/features.md'];
					});

					return projects;
				}
			})));

gulp.task('build-static-projects', ['build', 'store-project-json'],
	() =>
		gulp
			.src('./views/project/project-list.jsx')
			.pipe(jsxToHtml({projects: projectData['projects.json']}))
			.pipe(htmlmin())
			.pipe(gulp.dest('./public/html')));

gulp.task('build-static', ['build', 'build-static-resume', 'build-static-index', 'build-static-projects']);

gulp.task('set-publish-vars', (cb) => {
	production = true;
	cb();
});

gulp.task('publish-request-handlers', ['build-static'],
	() =>
		gulp
			.src(['./request-handlers/**/*.js'])
			.pipe(gulpSsh.dest('/home/protected/app/request-handlers/')));

gulp.task('publish-app', ['set-publish-vars', 'build-static', 'publish-request-handlers'],
	() =>
		gulp
			.src(['./app-release.js', './start-server.sh', './package.json'])
			.pipe(gulpSsh.dest('/home/protected/app/')));

gulp.task('publish-content', ['set-publish-vars', 'build-static'],
	() =>
		gulp
			.src('./public/**/*')
			.pipe(gulpSsh.dest('/home/protected/app/public/')));

gulp.task('publish-jsx', ['set-publish-vars'],
	() =>
		gulp
			.src('./views/**/*.jsx')
			.pipe(gulpSsh.dest('/home/protected/app/views/')));

gulp.task('publish', ['set-publish-vars', 'publish-app', 'publish-content', 'publish-jsx']);

gulp.task('update-server', ['publish'],
	// uninstall all the packages: `npm ls -p --depth=0 | awk -F/node_modules/ '{print $2}' | grep -vE '^(npm|)$' | xargs -r npm uninstall`
	() =>
		gulpSsh.shell([
			'cd /home/protected/app/',
			'chmod +x start-server.sh',
			'npm install --production',
			'npm update --production',
			'npm prune --production',
			'npm dedupe',
			'rm -rf /home/tmp/npm*',
			'npm cache clean'
		]));

gulp.task('deploy', ['publish', 'update-server']);
