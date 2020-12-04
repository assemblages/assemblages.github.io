const gulp = require('gulp');
const sass = require('gulp-sass');
const sourceMaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync')
const del = require('del')

//SCSS compilation

function styleMain() {
    return gulp.src('./src/scss/*.scss')
    .pipe(sourceMaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourceMaps.write('./'))
    .pipe(gulp.dest('./src/css'))
    .pipe(browserSync.stream())
}

function styleAssemblages() {
    return gulp.src('./assemblages/assets/scss/*.scss')
    .pipe(sourceMaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourceMaps.write('./'))
    .pipe(gulp.dest('./demo/assets/css'))
    .pipe(browserSync.stream())
}

function watch() {
    browserSync.init({
        server: {
            baseDir: './',
        },
        startPath: './assemblages/index.html',
        ghostMode: false,
        notify: false
    });
    gulp.watch('./src/scss/**/*.scss', styleMain);
    gulp.watch('./assemblages/assets/scss/**/*.scss', styleAssemblages);
    gulp.watch('./**/*.html').on('change', browserSync.reload);
    gulp.watch('./assets/js/**/*.js').on('change', browserSync.reload);

}

function cleanVendors(){
    return del('./assets/vendors/**/*');
}

function buildAddonVendors() {
    var addon1 = gulp.src('./node_modules/bootstrap/**/*')
                     .pipe(gulp.dest('./assets/vendors/bootstrap'));
    var addon2 = gulp.src('./node_modules/@mdi/**/*')
                     .pipe(gulp.dest('./assets/vendors/@mdi'));
    var addon3 = gulp.src('./node_modules/jquery/**/*')
                     .pipe(gulp.dest('./assets/vendors/jquery'));
    var addon4 = gulp.src('./node_modules/popper.js/**/*')
                     .pipe(gulp.dest('./assets/vendors/popper.js'));

    return (addon1, addon2, addon3, addon4);
}

const deploy = require('gulp-gh-pages');
const useref = require('gulp-useref');
const uglify = require('gulp-uglify');
const gulpIf = require('gulp-if');
const cssnano = require('gulp-cssnano');
const imagemin = require('gulp-imagemin');

gulp.task('useref', function(){
    return gulp.src('assemblages/*.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        // Minifies only if it's a CSS file
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('dist'))
});

gulp.task('images', function(){
    return gulp.src('assemblages/assets/**/*.+(png|jpg|gif|svg)')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/assets/'))
});

gulp.task('clean:dist',function () {
    return del('dist');
})

/**
 * Push build to gh-pages
 */
gulp.task('deploy', function () {
    return gulp.src("./dist/**/*")
        .pipe(deploy())
});

exports.style = gulp.parallel(styleMain, styleAssemblages);
exports.watch = watch;
exports.cleanVendors = cleanVendors;
exports.buildAddonVendors = gulp.series(cleanVendors, buildAddonVendors);