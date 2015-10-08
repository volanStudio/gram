// Gulp tasks
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    watch = require('gulp-watch'),
    prefix = require('gulp-autoprefixer'),
    uncss = require('gulp-uncss'),
    minifyCSS = require('gulp-minify-css'),
    sass = require('gulp-sass'),
    size = require('gulp-size'),
    rename = require('gulp-rename'),
    csslint = require('gulp-csslint'),
    imagemin = require('gulp-imagemin'),
    pngcrush = require('imagemin-pngcrush'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    browserSync = require('browser-sync'),
    browserReload = browserSync.reload;


gulp.task('minify-css', function(){
  gulp.src('./css/all.css')
    .pipe(size({gzip: false, showFiles: true, title:'unminified css'}))
    .pipe(size({gzip: true, showFiles: true, title:'gzipped'}))
    .pipe(minifyCSS())
    .pipe(rename('all.min.css'))
    .pipe(size({gzip: false, showFiles: true, title:'minified css'}))
    .pipe(size({gzip: true, showFiles: true, title:'gzipped'}))
    .pipe(gulp.dest('./css/'))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('minify-images', function(){
  gulp.src('./img-src/*')
   .pipe(size({gzip: false, showFiles: true, title:'original image size'}))
   .pipe(size({gzip: true, showFiles: true, title:'original image size'}))
   .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngcrush()]
    }))
    .pipe(size({gzip: false, showFiles: true, title:'minified image size'}))
    .pipe(size({gzip: true, showFiles: true, title:'minified image size'}))
    .pipe(gulp.dest('./img'));
});

gulp.task('csslint', function(){
  gulp.src('./css/all.css')
    .pipe(csslint({
        'compatible-vendor-prefixes': false,
        'box-sizing': false,
        'important': false,
        'known-properties': false
      }))
    .pipe(csslint.reporter());
});

gulp.task('pre-process', function(){
  gulp.src('./sass/all.scss')
      .pipe(watch(function(files) {
        return files.pipe(sass())
          .pipe(size({gzip: false, showFiles: true, title:'without vendor prefixes'}))
          .pipe(size({gzip: true, showFiles: true, title:'without vendor prefixes'}))
          .pipe(prefix())
          .pipe(size({gzip: false, showFiles: true, title:'after vendor prefixes'}))
          .pipe(size({gzip: true, showFiles: true, title:'after vendor prefixes'}))
          .pipe(gulp.dest('css'))
          .pipe(browserSync.reload({stream:true}));
      }));
});

gulp.task('uncss', function() {
  return gulp.src('css/all.css')
    .pipe(uncss({
      ignore: ['a:link','a:hover','a:visited','a:active', 'a:focus'],
      html: ['index.html']
    }))
    .pipe(minifyCSS())
    .pipe(rename('all.production.css'))
    .pipe(gulp.dest('./css'));
});

gulp.task('browser-sync', function() {
  browserSync.init(null, {
    server: {
      baseDir: "./"
    }
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('default', ['pre-process', 'minify-css', 'bs-reload', 'browser-sync'], function(){
  gulp.start('pre-process', 'csslint');
  gulp.watch('sass/*.scss', ['pre-process', 'minify-css']);
  gulp.watch(['css/all.css', 'index.html'], ['bs-reload']);
  gulp.watch('*.html', ['bs-reload', 'uncss']);
});
