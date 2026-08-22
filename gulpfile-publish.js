process.env.NODE_ENV = "production";

import { createRequire } from "module"
const require = createRequire(import.meta.url);

import gulp from 'gulp';
import through2 from 'through2';
import React from 'react';
import ReactDomServer from 'react-dom/server';
import appConfig from "./app/app-config.cjs";
import htmlmin from 'gulp-htmlmin';
import del from 'del';
import fs from 'fs/promises';
import projectLoader from './app/request-handlers/project-loader.js';
import { rollup } from 'rollup';
import rollupConfig from './rollup-config.js';
import path from "path";
import { include } from './app/gulpfile.js'
import * as vm from "vm";

// Register dynamic build tasks
const appBuild = include({ production: true });

const promiseStream = (gulpStream) => new Promise((resolve, reject) => gulpStream.on('end', resolve).on('error', reject));

// Static build tasks
function jsxToHtml(options) {
  return through2.obj(function (file, enc, cb) {
    require('node-jsx').install({extension: '.jsx'});

    let component = {};

    if (file.contents) {
      const js = file.contents.toString();
      const script = new vm.Script(`
((module, require) => {
${js}

return module.exports;
});
`);
      component = script.runInThisContext()(require('node:module'), require);
    }

    if (!component) {
      component = file.contents || require(file.path);
      component = component.default || component;
    }

    const markup = '<!doctype html>' + ReactDomServer.renderToStaticMarkup(React.createElement(component, options));
    file.contents = Buffer.from(markup);
    file.path = file.path.replace(path.extname(file.path), '.html');

    this.push(file);

    cb();
  });
}

const cleanBuild = () => del(['build', 'staging']);

async function copyDynamicBuild() {
  const baseDir = './app/public/';
  const destinationDirectory = './build/public/';
  await fs.cp(baseDir, destinationDirectory, { force: true, recursive: true });
}

function bundleJs() {
  return through2.obj(async function (file, enc, cb) {
    try {
      const bundle = await rollup(Object.assign(
        rollupConfig,
        {
          input: file.path,
        }));

      const { output } = await bundle.generate({format: 'cjs'});

      file.contents = Buffer.from(output[0].code);
      file.path = file.path.replace(path.extname(file.path), '.cjs');

      this.push(file);
      cb();
    } catch (e) {
      cb(e);
    }
  });
}

function buildServerJs() {
  return gulp.src('./app/app-release.js')
    .pipe(bundleJs())
    .pipe(gulp.dest('./build'));
}

async function buildStaticResume() {
	const rawMarkdown = await fs.readFile(appConfig.resumeLocation);

	await promiseStream(gulp
		.src('./app/views/resume/resume.js')
		.pipe(bundleJs())
		.pipe(jsxToHtml({resume: rawMarkdown}))
		.pipe(htmlmin())
		.pipe(gulp.dest('./build/public/html')));
}

async function buildStaticIndex() {
	const rawMarkdown = await fs.readFile(appConfig.bio.path);

	await promiseStream(gulp
		.src('./app/views/index/index.js')
		.pipe(bundleJs())
		.pipe(jsxToHtml({bio: rawMarkdown}))
		.pipe(htmlmin())
		.pipe(gulp.dest('./build/public/html')));
}

async function buildStaticProjects() {
	const portfolios = await projectLoader('/projects');

	await promiseStream(gulp
		.src('./app/views/project/project-list.js')
		.pipe(bundleJs())
		.pipe(jsxToHtml({projects: portfolios}))
		.pipe(htmlmin())
		.pipe(gulp.dest('./build/public/html')));
}

const copyNodeProjectData = () => gulp.src(['./app/start-server.sh']).pipe(gulp.dest('./build'));

const buildStatic = gulp.series(
	cleanBuild,
	appBuild.build,
	gulp.parallel(
		appBuild.copyPublicFonts,
		copyDynamicBuild,
		copyNodeProjectData,
		buildServerJs,
		buildStaticIndex,
		buildStaticResume,
		buildStaticProjects,
  )
);

const buildResume = gulp.series(
  cleanBuild,
  appBuild.buildResumePdf,
  copyDynamicBuild,
  buildStaticResume);

const buildPortfolio = gulp.series(
  cleanBuild,
  appBuild.buildProjectImages,
  copyDynamicBuild,
  buildStaticProjects);

export {
  buildStatic,
  buildResume,
  buildPortfolio,
};
