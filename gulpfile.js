const gulp = require('gulp');
const clean = require('gulp-clean');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('gulp-better-rollup');
const rollupRoot = require('rollup-plugin-root-import');
const cssImport = require('gulp-cssimport');
const cleanCss = require('gulp-clean-css');
const replace = require('gulp-replace');
const htmlReplace = require('gulp-html-replace');
const merge = require('merge2');

const ROOT_PATH = `${__dirname}/../../`;

function bundleJs(appName) {
    return gulp.src(`${appName}/elements/app/app.js`)
        .pipe(sourcemaps.init())
        .pipe(rollup({
            plugins: [
                rollupRoot({
                    // specify absolute paths in order for rollup plugins to match module IDs
                    root: ROOT_PATH,
                    extensions: '.js'
                })
            ]
        }, {
            format: 'iife'
        }))
}

function bundleCss(appName) {
    //const proccessed = new Set();
    return gulp.src(`${appName}/elements/app/app.css`)
        .pipe(sourcemaps.init())
        .pipe(cssImport({
            includePaths: [ROOT_PATH],
            transform: path => {
                // transform absolute paths to nimiq root path
                if (path.startsWith('/')) path = `${__dirname}/../..${path}`;
                /*if (proccessed.has(path)) return false; // works but leaves the @import
                proccessed.add(path); */
                return path;
            }
        }))
        // the css import will inline the same css multiple times if imported multiple times thus we'll clean it up.
        .pipe(cleanCss({
            level: 2
        }))
}

function moveAssets(assetPaths, jsStream, cssStream) {
    const assetFileNames = assetPaths.map(path => path.substr(path.lastIndexOf('/') + 1));
    const resolvedAssetPaths = assetPaths.map(path => path.startsWith('/')? ROOT_PATH+path : path);
    const assetsStream = gulp.src(resolvedAssetPaths); // copy assets unchanged
    // replace the asset path in js and css
    for (let i=0; i<assetPaths.length; ++i) {
        const regex = new RegExp(assetPaths[i], 'g');
        jsStream = jsStream.pipe(replace(regex, assetFileNames[i]));
        cssStream = cssStream.pipe(replace(regex, assetFileNames[i]));
    }
    return [jsStream, cssStream, assetsStream];
}

function getAssets(appName) {
    switch (appName) {
        case 'verify':
        case 'activate':
        case 'dashboard':
            return ['/elements/screen-error/screen-error.svg'];
        default:
            return [];
    }
}

function build(appName) {
    let jsStream = bundleJs(appName);
    let cssStream = bundleCss(appName);
    let assetsStream;
    [jsStream, cssStream, assetsStream] = moveAssets(getAssets(appName), jsStream, cssStream);
    const htmlStream = gulp.src(`${appName}/index.html`)
        .pipe(htmlReplace({
            'js': 'app.js',
            'css': 'app.css'
        }));
    return merge([jsStream, cssStream, assetsStream, htmlStream])
        .pipe(gulp.dest(`${appName}/dist/`));
}

function cleanBuild(buildName) {
    return new Promise(resolve =>
        gulp.src(`${buildName}/dist`, {read: false})
            .pipe(clean())
            .on('end', resolve)
    );
}

gulp.task('clean-activate-app', () => cleanBuild('activate'));
gulp.task('clean-verify-app', () => cleanBuild('verify'));
gulp.task('clean-dashboard-app', () => cleanBuild('dashboard'));

gulp.task('build-activate-app', () => build('activate'));
gulp.task('build-verify-app', () => build('verify'));
gulp.task('build-dashboard-app', () => build('dashboard'));

gulp.task('clean', ['clean-activate-app', 'clean-verify-app', 'clean-dashboard-app']);
gulp.task('default', ['build-activate-app', 'build-dashboard-app', 'build-verify-app']);


// TODO minification
