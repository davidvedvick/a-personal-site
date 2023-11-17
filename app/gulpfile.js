import { createRequire } from "module"
const require = createRequire(import.meta.url);

import projectLoader from "./request-handlers/project-loader.js";
import appConfig from './app-config.cjs';

import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';

import { fileURLToPath } from 'url'
import { dirname } from 'path'

import {marked} from "marked";
import Printer from "pagedjs-cli";

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const browserify = require('browserify');
const terser = require('gulp-terser');
const cleanCss = require('gulp-clean-css');
const del = require('del');
const through2 = require('through2');
const rename = require('gulp-rename');
const parallel = require('concurrent-transform');

const os = require('os');
const path = require('path');
const envify = require('envify');
const Jimp = require("jimp");
const {promisify} = require("util");
const fs = require("fs");

const npmSassAliases = {};
/**
* Will look for .scss|sass files inside the node_modules folder
*/
function npmSassResolver(url, file, done) {
	// check if the path was already found and cached
	if(npmSassAliases[url]) {
		return done({ file: npmSassAliases[url] });
	}

	// look for modules installed through npm
	try {
		const newPath = require.resolve(url);
		npmSassAliases[url] = newPath; // cache this request
		return done({ file: newPath });
	} catch(e) {
		// if your module could not be found, just return the original url
		npmSassAliases[url] = url;
		return done({ file: url });
	}
}

const sass = require('sass');

const gulpSass = require('gulp-sass')(sass);

const deSassify = () => gulpSass(
	{
		importer: npmSassResolver
	}).on('error', gulpSass.logError);

let production = false;
let outputDir = __dirname;

const promiseMkDir = promisify(fs.mkdir);

const promiseCopyFile = promisify(fs.copyFile);
const getOutputDir = (relativeDir) => path.join(outputDir, relativeDir || '');
const getInputDir = (relativeDir) => path.join(__dirname, relativeDir || '');
const nodeModuleDir = path.join(__dirname, '../node_modules');

const numberOfCpus = os.cpus().length;

// Dynamic build content

function clean() {
	return del([getOutputDir('public')]);
}

function buildJs() {
	const destDir = getOutputDir('public/js');

  let pipe = gulp.src(getInputDir('views/**/*.client.{js,jsx}'))
    .pipe(parallel(
      through2.obj((file, enc, next) =>
        browserify(file.path, {extensions: '.jsx', debug: !production})
          .transform(envify)
          .transform('babelify', {
            presets: [
              [
                '@babel/preset-env', {
                  "targets": {
                    "browsers": ["last 2 versions"]
                  }
                }
              ],
              '@babel/preset-react',
            ],
            plugins: ['@babel/transform-runtime', '@babel/plugin-proposal-optional-chaining']
          })
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
		? pipe.pipe(parallel(terser({ compress: { passes: 2, unsafe: true } }), numberOfCpus))
		: pipe
			// .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
			.pipe(sourcemaps.write(getOutputDir())); // writes .map file

	return pipe.pipe(gulp.dest(destDir));
}

// copy slick carousel blobs
function collectSlickBlobs() {
	return gulp
		.src([`${nodeModuleDir}/slick-carousel/slick/**/*.{woff,tff,gif,jpg,png}`])
		.pipe(gulp.dest(getOutputDir('public/css')));
}

// Bundle SASS
function transformSass() {
	return gulp.src(getInputDir('views/layout.scss'))
			.pipe(deSassify())
			.pipe(cleanCss())
			.pipe(gulp.dest(getOutputDir('public/css')));
}

const buildCss = gulp.parallel(collectSlickBlobs, transformSass);

function buildPublicImages() {
	return gulp.src(getInputDir('imgs/*')).pipe(gulp.dest(getOutputDir('public/imgs')));
}

function copyPublicFonts() {
	return gulp.src(getInputDir('fonts/*')).pipe(gulp.dest(getOutputDir('public/fonts')));
}

async function buildProfileImage() {
  const sourceProfilePicture = appConfig.bio.authorPicture;
  const image = await Jimp.read(sourceProfilePicture);
  const resizedImage = image.resize(Jimp.AUTO, 500);
  await resizedImage.write(path.join(getOutputDir('public/imgs'), 'profile-picture.jpg'));
}

async function buildProjectImages() {
  const projects = await projectLoader();

  const inputDir = appConfig.projectsLocation;
	const destDir = getOutputDir('public/projects');
	await Promise.all(projects
    .flatMap(p => [p.image?.url, ...p.examples.map(i => i.url)])
    .filter(uri => uri)
    .map(async uri => {
      if (!uri || uri.startsWith("http://") || uri.startsWith("https://")) return;

      const destination = path.join(destDir, path.relative(inputDir, uri));
      if (path.extname(destination) === ".svg") {
        const directory = path.dirname(destination);
        console.log(`Making directory ${directory}.`);
        await promiseMkDir(directory, { recursive: true })
        await promiseCopyFile(uri, destination)
        return;
      }

      const image = await Jimp.read(uri);
      const resizedImage = image.resize(Jimp.AUTO, 300);
      await resizedImage.write(destination);
    }));
}

const buildImages = gulp.parallel(buildPublicImages, buildProjectImages, buildProfileImage);

async function buildResumePdf() {
	const resumeLocation = appConfig.resumeLocation;
	const fileName = path.basename(resumeLocation, "md");

  const sassPath = getInputDir('views/layout.scss');

  const { css } = await sass.compileAsync(
    sassPath,
    {
      loadPaths: [ path.resolve(path.dirname(sassPath)) ],
      // importer: npmSassResolver
     /* functions: {
        'url($url)': async function(url) {
          const unresolvedUrl = url[0].assertString('url').text;
          const dataPrefix = 'data:font/woff;base64,';
          try {
            const response = await fetch(unresolvedUrl);
            const blob = await response.blob();
            const buffer = await blob.arrayBuffer();
            const base64 = buffer.toString('base64');
            return new sass.SassString(dataPrefix + base64);
          } catch (e) {
            const localPath = path.join(__dirname, unresolvedUrl);
            const buffer = await fs.promises.readFile(localPath);
            const base64 = buffer.toString('base64');
            return new sass.SassString(dataPrefix + base64);
          }
        }
      }*/
    });

  const html = `
<html lang="en">
<!--<link href="public/css/layout.css" type="text/css" rel="stylesheet" />-->
<style>
${css}
</style>
<body>
    <div class="resume">
        ${marked((await fs.promises.readFile(resumeLocation)).toString())}
    </div>
</body>
</html>
`;

  const intermediateOutputDir = getOutputDir('public/pdf');

  await fs.promises.mkdir(intermediateOutputDir)

  try {

    const intermediateFileName = path.join(intermediateOutputDir, 'resume.html');
    await fs.promises.writeFile(intermediateFileName, html);

    const printer = new Printer({
      // styles: ['public/css/layout.css'],
      allowLocal: true,
      allowRemote: true,
      headless: true,
    });

    try {
      await printer.setup();

      const debugHtml = await printer.html(intermediateFileName, true);
      const intermediateDebugHtmlName = path.join(intermediateOutputDir, 'paged-resume.html');
      await fs.promises.writeFile(intermediateDebugHtmlName, debugHtml);

      const file = await printer.pdf(
        intermediateFileName,
        {
          outlineTags: ["h1", "h2", "h3"],
        });

      const target = path.resolve(path.join(getOutputDir('public'), fileName) + 'pdf');
      await fs.promises.writeFile(target, file);
    } finally {
      await printer.close();
    }
  } finally {
    await fs.promises.rm(intermediateOutputDir, { recursive: true, force: true });
  }
}

const buildSite = gulp.series(
	clean,
	gulp.parallel(
		buildJs,
		gulp.series(buildCss, buildResumePdf),
		buildImages,
		copyPublicFonts));

export function watch() {
	gulp.watch('./views/**/*.scss', buildCss);
	gulp.watch('./imgs/**/*', buildImages);
	// gulp.watch(appConfig.projectsLocation, buildProjectImages);
	gulp.watch('./views/**/*.client.{js,jsx}', buildJs);
	gulp.watch(appConfig.resumeLocation, buildResumePdf);
}

export function include(options) {
  production = options.production || production;
	outputDir = options.outputDir || outputDir;

  return {
    build: buildSite,
    buildImages: gulp.series(clean, buildImages),
    buildProjectImages: buildProjectImages,
    copyPublicFonts: copyPublicFonts,
    buildResumePdf: gulp.series(clean, buildCss, buildResumePdf)
  };
}

export default buildSite;