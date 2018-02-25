const gulp = require('gulp');

const NimiqBuild = require('../../meta/build-process/nimiq-base-gulpfile.js');

function getAssets(appName) {
    const commonAssets = [
        '/elements/screen-error/screen-error.svg',
        '/elements/browser-warning/browser-warning.js'
    ];
    switch (appName) {
        case 'activate':
            return commonAssets.concat(['/libraries/qr-scanner/qr-scanner-worker.min.js', '/libraries/iqons/dist/iqons.min.svg']);
        case 'dashboard':
            return commonAssets.concat(['/libraries/iqons/dist/iqons.min.svg']);
        case 'verify':
            return commonAssets.concat([
                '/apps/nimiq-activation/verify/moment.min.js',
                '/apps/nimiq-activation/verify/success.html',
                '/apps/nimiq-activation/verify/error.html'
            ]);
        default:
            return commonAssets;
    }
}

function build(appName, toRoot = false) {
    return NimiqBuild.build(`${appName}/elements/app/app.js`, `${appName}/elements/app/app.css`,
        `${appName}/index.html`, getAssets(appName), `${__dirname}/../../`,
        `deployment/dist/${ toRoot ? '' : `${appName}/`}`)
}

function cleanBuild(appName = null) {
    const path = appName === null? 'deployment' : `deployment/dist/${appName}`;
    return NimiqBuild.cleanBuild(path);
}

gulp.task('clean-activate-app', () => cleanBuild('activate'));
gulp.task('clean-verify-app', () => cleanBuild('verify'));
gulp.task('clean-dashboard-app', () => cleanBuild('dashboard'));
gulp.task('clean-validate-app', () => cleanBuild('validate'));
gulp.task('clean-contributors-app', () => cleanBuild('contributors'));

gulp.task('build-activate-app', () => build('activate'));
gulp.task('build-verify-app', () => build('verify', true));
gulp.task('build-dashboard-app', () => build('dashboard'));
gulp.task('build-validate-app', () => build('validate'));
gulp.task('build-contributors-app', () => build('contributors'));

gulp.task('clean', () => cleanBuild());
gulp.task('build', ['build-activate-app', 'build-verify-app', 'build-dashboard-app', 'build-contributors-app', 'build-contributors-app']);

gulp.task('default', ['build']);

