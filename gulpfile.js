/*
* GulpFile
* @author: Kévin Thenard
*
*/
'use strict';

var gulp         = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var compass      = require('gulp-compass');
var concat       = require('gulp-concat');
var cssmin       = require('gulp-cssmin');
var imagemin     = require('gulp-imagemin');
var notify       = require('gulp-notify');
var plumber      = require('gulp-plumber');
var rename       = require('gulp-rename');
var uglify       = require('gulp-uglify');
var watch        = require('gulp-watch');
var pngquant     = require('imagemin-pngquant');
var jshint       = require('gulp-jshint');

var opacity      = function (css, opts) {
    css.eachDecl(function(decl) {
        if (decl.prop === 'opacity') {
            decl.parent.insertAfter(decl, {
                prop: '-ms-filter',
                value: '"progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (parseFloat(decl.value) * 100) + ')"'
            });
        }
    });
};

var basePath   = 'assets/';

var jsPath       = 'js/';
var jsSrc        = [basePath + jsPath + '/front/jquery.validate.js',
                    basePath + jsPath + '/front/jquery.cookies.js',
                    basePath + jsPath + '/jquery/jquery.selectboxes.js',
                    basePath + jsPath + '/front/owl.carousel.js',
                    basePath + jsPath + '/front/mmenu.js',
                    basePath + jsPath + '/front/is.js',
                    basePath + jsPath + '/front/b.js',
                    basePath + jsPath + '/front/jquery.i18n.js',
                    basePath + jsPath + '/front/dictionaries/dic_fr_FR.js',
                    basePath + jsPath + '/front/jquery.query-object.js',
                    basePath + jsPath + '/front/main.js'];
var jsDest       = jsPath + 'built.js';
var jsDestMin    = jsPath + 'built.min.js';
var jsMain       = [jsPath + 'front/main.js'];

var scssPath     = 'scss/';
var cssPath      = 'css/';

var imgSrc       = '_img/';
var imgDest      = 'images/';

gulp.task('imagemin', function() {
    return gulp.src(basePath + imgSrc + '**/*')
        .pipe(imagemin({
          optimizationLevel: 1,
            progressive: true,
            interlaced: true,
            svgoPlugins: [{
              removeViewBox: false
            }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(basePath + imgDest));
});


gulp.task('sass', ['imagemin'], function () {
  gulp.src(basePath + scssPath + '**/*.scss')
    .pipe(plumber({
      errorHandler: notify.onError("Error with sass : <%= error.message %>")
    }))
    .pipe(compass({
      css: basePath + cssPath,
      sass: basePath + scssPath,
      image: basePath + imgDest,
      style: 'compressed'
    }))
    .pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: false
    }))
    .pipe(gulp.dest(basePath + cssPath));
});

gulp.task('js', function() {
  return gulp.src(jsSrc)
      .pipe(concat(jsDest))
      .pipe(gulp.dest(basePath))
      .pipe(uglify())
      .pipe(rename(basePath + jsDestMin))
      .pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
  watch(basePath + imgSrc + '**/*', function () {
    gulp.start('imagemin');
  });
  watch(basePath + scssPath + '**/*.scss', function () {
    gulp.start('sass');
  });
  watch(jsSrc, function () {
    gulp.start('js');
  });
});

gulp.task('lint', function() {
  return gulp.src(basePath + jsPath + 'front/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('gulp-jshint-file-reporter', {
      filename: 'jshint-output.log'
    }));
});

gulp.task('build', ['sass']);
gulp.task('default', ['build', 'watch']);