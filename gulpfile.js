// Declarartion
var gulp = require('gulp');
var gulp = require('gulp-concat');
var tslint = require('gulp-tslint');
var ts = require('gulp-typescript');
var browserify = require('browserify'),
    transform = require('vinyl-transform'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');
var karma = require('karma');
var browserified = transform(function (filename) {
    var b = browserify({
        entries: filename,
        debug: true
    });
    return b.bundle();
});
gulp.task('default', function () { // Declare a function named 'default'
    console.log('Hello World');
});
gulp.task('lint', function () {
    return gulp.src([
            './source/ts/**/**.ts', // Read All subfolders and all their *.ts files
            './test/**/**.ts'
        ]).pipe(tslint()) // Output stream will be sent to tslint()
        .pipe(tslint.report('verbose')); // Output from tslint() will be sent to tslint.report function
}); // Check whether our TypeScript code follows a series of recommended practices
var tsProject = ts.createProject({
    removeComments: true,
    noImplicitAny: true,
    target: 'ES3',
    module: 'commonjs',
    declarationFiles: false // All of these are options for ts complier (compiling ts to js).
});
gulp.task('tsc', function () {
    return gulp.src('/source/ts/**/**.ts') // like lint task
        .pipe(ts(tsProject))
        .js.pipe(gulp.dest('./temp/source/js')); // .js write it as *.js file and then write it down
});
var tsTestProject = ts.createProject({
    removeComments: true,
    noImplicitAny: true,
    target: 'ES3',
    module: 'commonjs',
    declarationFiles: false // Like tsProject
});
gulp.task('tsc-tests', function () {
    return gulp.src('.test/**/**.test.ts')
        .pipe(ts(tsTestProject))
        .js.pipe(gulp.dest('./temp/test/'));
});
gulp.task('bundle-js', function () {
    return gulp.src('./temp/source/js/main.js')
        .pipe(browserified)
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/source/js/'));
});
gulp.task('bundle-test', function () {
    return gulp.src('.temp/test/**/**.test.js')
        .pipe(browserified)
        .pipe(gulp.dest('./dist/test/'))
});
function cb() {
    console.log('just finish callback');
};
gulp.task('karma', function (cb) {
    gulp.src('./dist/test/**/**.test.js')
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }))
        .on('end', cb)
        .on('error', function (error) {
            // Make sure failed tests cause gulp to exti non-zero
            throw err;
        });
});
gulp.task('bundle', function(cb) {
    runSequence('build', [
        'bundle-js', 
        'bundle-test'
    ], cb);
});
gulp.task('test', function(cb){
    runSequence('bundle', ['karma'], cb);
})
gulp.task('default', ['lint', 'tsc', 'tsc-tests', 'bundle-js', 'bundle-test', 'karma']); // Add them as subtasks of default task
