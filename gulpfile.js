const gulp = require('gulp');
const clean = require('gulp-clean');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('gulp-better-rollup');
const rollupRoot = require('rollup-plugin-root-import');
const cssImport = require('gulp-cssimport');
const cleanCss = require('gulp-clean-css');
const htmlReplace = require('gulp-html-replace');

function bundleJs(bundleName) {
    return new Promise(resolve => {
        const stream = gulp.src(`${bundleName}/elements/app/app.js`)
            .pipe(sourcemaps.init())
            .pipe(rollup({
                plugins: [
                    rollupRoot({
                        // specify absolute paths (i.e. using __dirname) in order for rollup plugins to match module IDs
                        root: `${__dirname}/../../`,
                        extensions: '.js'
                    })
                ]
            }, {
                format: 'iife'
            }))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(`${bundleName}/dist/`));
        stream.on('end', () => resolve(stream));
    });
}

function bundleCss(bundleName) {
    return new Promise(resolve => {
        //const proccessed = new Set();
        const stream = gulp.src(`${bundleName}/elements/app/app.css`)
            .pipe(sourcemaps.init())
            .pipe(cssImport({
                includePaths: [`${__dirname}/../../`],
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
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(`${bundleName}/dist/`));
        stream.on('end', () => resolve(stream));
    });
}

function bundle(bundleName) {
    return Promise.all([
        bundleJs(bundleName),
        bundleCss(bundleName)
    ]).then(() =>
        new Promise(resolve => {
            const stream = gulp.src(`${bundleName}/index.html`)
                .pipe(htmlReplace({
                    'js': 'app.js',
                    'css': 'app.css'
                }))
                .pipe(gulp.dest(`${bundleName}/dist/`));
            stream.on('end', () => resolve(stream));
        })
    );
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

gulp.task('build-activate-app', () => bundle('activate'));
gulp.task('build-verify-app', () => bundle('verify'));
gulp.task('build-dashboard-app', () => bundle('dashboard'));

gulp.task('clean', ['clean-activate-app', 'clean-verify-app', 'clean-dashboard-app']);
gulp.task('default', ['build-activate-app', 'build-dashboard-app', 'build-verify-app']);


// TODO minification
