module.exports = (gulp) => {
  const rename = require('gulp-rename');
  const concat = require('gulp-concat');
  const filesExist = require('files-exist');
  const sourcemaps = require('gulp-sourcemaps');
  const imagemin = require('gulp-imagemin');
  const jpegoptim = require('imagemin-jpegoptim');
  const log = require('fancy-log');
  const newer = require('gulp-newer');
  const plumber = require('gulp-plumber');
  const svg2png = require('gulp-svg2png-update');
  const gulpIf = require('gulp-if');
  const babel = require('gulp-babel');
  const autoprefixer = require('gulp-autoprefixer');
  const sass = require('gulp-sass')(require('sass'));
  const cleanCSS = require('gulp-clean-css');
  const cssimport = require('gulp-cssimport');
  const terser = require('gulp-terser');
  const favicons = require('gulp-favicons');
  const downloader = require('goog-webfont-dl');
  const merge = require('merge-stream');

  const config = require('./config.js')();

  const fileExistOptions = {
    onMissing: (file) => {
      console.log('File not found: ' + file);
      return false;
    },
    checkGlobs: true
  };

  const importOptions = {
    matchPattern: '*.css$' // Process only css
  };

  // ==================
  // GENERATE PHASE
  // ==================

  // Genera la versió minificada dels css a partir dels fitxers sass i altres css
  gulp.task('generate:css', () => {
    let stream = merge();
    for (let file in config.cssFiles) {
      if ({}.hasOwnProperty.call(config.cssFiles, file)) {
        let files = config.cssFiles[file];

        let current = gulp.src(filesExist(files, fileExistOptions))
          //.pipe(plumber('CSS generate'))
          .pipe(sourcemaps.init())
          .pipe(rename({ extname: '.scss' }))
          .pipe(gulpIf('*.scss', sass.sync({
            includePaths: config.sassIncludePaths,
            indentedSyntax: false
          }).on('error', function (err) {
            sass.logError;
            this.emit('end');
          })))
          .pipe(cssimport(importOptions))
          .pipe(autoprefixer())
          .pipe(cleanCSS({
            compatibility: 'ie10',
            rebase: false
          }))
          .pipe(concat(file))
          .pipe(sourcemaps.write('maps'))
          .pipe(gulp.dest('assets/css/'))
          .on('end', () => {
            log('write css ' + file);
          });

        stream.add(current);
      }
    }

    return stream;
  });

  // Genera la versió minificada dels js a partir de les llibreries i altres css
  gulp.task('generate:js', () => {
    let stream = merge();
    for (let file in config.jsFiles) {
      if ({}.hasOwnProperty.call(config.jsFiles, file)) {
        let files = config.jsFiles[file];

        let current = gulp.src(filesExist(files, fileExistOptions))
          .pipe(plumber('JS generate'))
          .pipe(sourcemaps.init())
          .pipe(babel({
            presets: [["@babel/env", { modules: false }]]
          }))
          .pipe(terser())
          .pipe(concat(file))
          .pipe(sourcemaps.write('maps'))
          .pipe(gulp.dest('assets/js/'))
          .on('end', () => {
            log('write js ' + file);
          });

        stream.add(current);
      }
    }

    return stream;
  });

  // Optimitza les imatges
  gulp.task('generate:img', () => {
    let stream = merge();
    stream.add(gulp.src(config.svgFiles)
      .pipe(plumber('SVG generate'))
      .pipe(newer({
        dest: 'assets/img',
        ext: '.svg'
      }))
      .pipe(gulp.dest('assets/img'))
    );

    stream.add(gulp.src(config.imgFiles)
      .pipe(plumber('IMG generate'))
      .pipe(newer({
        dest: 'assets/img'
      }))
      .pipe(imagemin([
        imagemin.gifsicle(),
        jpegoptim({ progressive: true, max: 86 }),
        imagemin.optipng()
        //imagemin.svgo()
      ]))
      .pipe(gulp.dest('assets/img'))
    );

    return stream;
  });

  // Optimitza les imatges del full d'estils
  gulp.task('generate:imgcss', () => {
    let stream = merge();
    stream.add(gulp.src(config.svgcssFiles)
      .pipe(plumber('SVG generate'))
      .pipe(newer({
        dest: 'assets/css/img',
        ext: '.svg'
      }))
      .pipe(gulp.dest('assets/css/img'))
    );

    stream.add(gulp.src(config.imgcssFiles)
      .pipe(plumber('IMG generate'))
      .pipe(newer({
        dest: 'assets/css/img'
      }))
      .pipe(imagemin([
        imagemin.gifsicle(),
        jpegoptim({ progressive: true, max: 86 }),
        imagemin.optipng(),
        //imagemin.svgo()
      ]))
      .pipe(gulp.dest('assets/css/img'))
    );

    return stream;
  });

  // Copia les tipografies
  gulp.task('generate:fonts', () => {
    return gulp.src(config.fontFiles)
      .pipe(plumber('FONT generate'))
      .pipe(newer({
        dest: 'fonts'
      }))
      .pipe(gulp.dest('fonts'));
  });

  // Genera els favicons a partir del logo.png
  gulp.task('generate:favicons', () => {
    let stream = merge();
    stream.add(gulp.src(filesExist('dev/logo.svg', fileExistOptions))
      .pipe(gulp.dest('favicons'))
    );

    stream.add(gulp.src(filesExist('dev/logo.svg', fileExistOptions))
      .pipe(svg2png())
      .pipe(rename({ extname: '.png' }))
      .pipe(plumber('FAVICON generate'))
      .pipe(favicons({
        background: '#870d01',
        path: '/favicons',
        icons: {
          android: true, // Create Android homescreen icon. `boolean`
          appleIcon: true, // Create Apple touch icons. `boolean`
          appleStartup: false, // Create Apple startup images. `boolean`
          coast: false, // Create Opera Coast icon. `boolean`
          favicons: true, // Create regular favicons. `boolean`
          firefox: false, // Create Firefox OS icons. `boolean`
          opengraph: false, // Create Facebook OpenGraph image. `boolean`
          twitter: false, // Create Twitter Summary Card image. `boolean`
          windows: true, // Create Windows 8 tile icons. `boolean`
          yandex: false // Create Yandex browser icon. `boolean`
        }
      }))
      .pipe(gulp.dest('./favicons'))
    );

    return stream;
  });


  // Genera tots els fitxers necessaris per la web
  gulp.task('generate', gulp.series(
    gulp.parallel(
      'generate:js',
      'generate:css',
      'generate:img',
      'generate:imgcss',
      'generate:favicons',
      'generate:fonts'
    )
  ));

  // Descarrega les tipografies de google
  gulp.task('download:fonts', (cb) => {
    for (let font in config.googleFonts) {
      if ({}.hasOwnProperty.call(config.googleFonts, font)) {
        let types = config.googleFonts[font];

        downloader({
          font: font,
          formats: downloader.formats, // Font formats.
          destination: './dev/fonts/',
          out: './dev/scss/base/_googleFonts_' + font + '.scss',
          prefix: '../../fonts/',
          styles: types
        });
      }
    }

    cb();
  });

  // =============
  // WATCH
  // =============

  // Monitoritza els canvis al codi per actualitzar els fitxers per la web
  gulp.task('watch', () => {
    gulp.watch(['dev/scss/**/*.scss', 'dev/css/**/*.css'], gulp.series('generate:css'));
    gulp.watch(['dev/js/**/*.js'], gulp.series('generate:js'));
    gulp.watch(['dev/logo.svg'], gulp.series('generate:favicons'));
    gulp.watch(['dev/fonts/**/*'], gulp.series('generate:fonts'));
    gulp.watch(['dev/css/img/**/*'], gulp.series('generate:imgcss'));
    gulp.watch(['dev/img/**/*'], gulp.series('generate:img'));
  });

}
