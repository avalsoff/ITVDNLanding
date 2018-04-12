const gulp          = require('gulp');
const sass          = require('gulp-sass');
const browsersync   = require('browser-sync');
const concat        = require('gulp-concat');
const uglify        = require('gulp-uglify');
const cleancss      = require('gulp-clean-css');
const rename        = require('gulp-rename');
const autoprefixer  = require('gulp-autoprefixer');
const notify        = require("gulp-notify");
const pug           = require('gulp-pug');
const imagemin      = require('gulp-imagemin');
const del           = require('del');
const cache         = require('gulp-cache');
const spritesmith = require('gulp.spritesmith');

gulp.task('browser-sync', function() {
  browsersync({
    server: {
      baseDir: 'src'
    },
    notify: false,
    // open: false,
    // tunnel: true,
    // tunnel: "projectname", //Demonstration page: http://projectname.localtunnel.me
  })
});

gulp.task('sass', function() {
  return gulp.src('src/sass/**/*.sass')
  .pipe(sass({ outputStyle: 'expand' }).on("error", notify.onError()))
  .pipe(rename({ suffix: '.min', prefix : '' }))
  .pipe(autoprefixer(['last 15 versions']))
  // .pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
  .pipe(gulp.dest('src/css'))
  .pipe(browsersync.reload( {stream: true} ))
});

gulp.task('index-js', function() {
  return gulp.src([
    'src/js/index.js',
    ])
  .pipe(concat('index.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('src/js'));
});

gulp.task('js', ['index-js'], function() {
  return gulp.src([
    'src/libs/jquery/dist/jquery.min.js',
    'src/js/index.min.js', // Always at the end
    ])
  .pipe(concat('scripts.min.js'))
  // .pipe(uglify()) // Mifify js (opt.)
  .pipe(gulp.dest('src/js'))
  .pipe(browsersync.reload({ stream: true }))
});

gulp.task('pug', function() {
  return gulp.src('src/views/**/!(_)*.pug')
  .pipe(pug({
    pretty: true
  }).on("error", notify.onError()))
  .pipe(gulp.dest('src'))
  .pipe(browsersync.reload( {stream: true} ))
});

gulp.task('imagemin', function() {
  return gulp.src('src/img/**/*')
  .pipe(cache(imagemin()))
  .pipe(gulp.dest('build/img')); 
});

gulp.task('sprite', function(cb) {
  const spriteData = gulp.src('src/img/icons/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    imgPath: '../img/sprite.png',
    cssName: 'sprite.sass'
  }));

  spriteData.img.pipe(gulp.dest('build/img/'));
  spriteData.css.pipe(gulp.dest('src/styles/global/'));
  cb();
});

gulp.task('build', ['removebuild', 'imagemin', 'pug', 'sass', 'js'], function() {

  var buildFiles = gulp.src([
    'src/.htaccess',
    ]).pipe(gulp.dest('build'));

  var buildHtml = gulp.src([
    'src/*.html',
  ]).pipe(gulp.dest('build'));

  var buildCss = gulp.src([
    'src/css/main.min.css',
    ]).pipe(gulp.dest('build/css'));

  var buildJs = gulp.src([
    'src/js/scripts.min.js',
    ]).pipe(gulp.dest('build/js'));

  var buildFonts = gulp.src([
    'src/fonts/**/*',
    ]).pipe(gulp.dest('build/fonts'));
});

gulp.task('watch', ['pug', 'sass', 'js', 'browser-sync'], function() {
  gulp.watch('src/views/**/*.pug', ['pug']);
  gulp.watch('src/sass/**/*.sass', ['sass']);
  gulp.watch(['libs/**/*.js', 'src/js/index.js'], ['js']);
});

gulp.task('removebuild', function() { return del.sync('build'); });
gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);