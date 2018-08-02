const gulp = require('gulp');

const NimiqBuild = require('../../meta/build-process/nimiq-base-gulpfile.js');

const commonAssets = [];

function build(appName, toRoot = false) {
    return NimiqBuild.build({
          jsEntry: `${appName}/elements/app/app.js`,
          cssEntry: `${appName}/elements/app/app.css`,
          htmlEntry: `${appName}/index.html`,
          assetPaths: commonAssets,
          rootPath: `${__dirname}/../../`,
          distPath: `deployment/dist/${ toRoot ? '' : `${appName}/`}`
    });
}

function cleanBuild(appName = null) {
    const path = appName === null? 'deployment/dist' : `deployment/dist/${appName}`;
    return NimiqBuild.cleanBuild(path);
}

gulp.task('clean-activate-app', () => cleanBuild('activate'));
gulp.task('clean-verify-app', () => cleanBuild());
gulp.task('clean-dashboard-app', () => cleanBuild('dashboard'));
gulp.task('clean-validate-app', () => cleanBuild('validate'));
gulp.task('clean-contributors-app', () => cleanBuild('contributors'));

gulp.task('build-activate-app', () => build('activate'));
gulp.task('build-verify-app', () => build('verify', true));
gulp.task('build-dashboard-app', () => build('dashboard'));
gulp.task('build-validate-app', () => build('validate'));
gulp.task('build-contributors-app', () => build('contributors'));

gulp.task('clean', () => cleanBuild());
gulp.task('build', gulp.parallel('build-activate-app', 'build-verify-app', 'build-dashboard-app', /*'build-validate-app',*/ 'build-contributors-app'));

gulp.task('default', gulp.series('build'));

