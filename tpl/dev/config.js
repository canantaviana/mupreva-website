module.exports = function () {
  var config = {
    cssFiles: {
      'app.css': [
        // Estils del web
        'dev/scss/app.scss'
      ],
    },

    jsFiles: {
      "app.js": [
        // 'node_modules/jquery/dist/jquery.js',
        // 'node_modules/magnific-popup/dist/jquery.magnific-popup.js',
        // 'node_modules/headroom.js/dist/headroom.js',
        // 'node_modules/headroom.js/dist/jQuery.headroom.js',
        // 'node_modules/@accessible360/accessible-slick/slick/slick.js',
        // 'node_modules/a11y-toggle/a11y-toggle.js',
        // 'dev/js/houdini/base.js',
        'node_modules/van11y-accessible-hide-show-aria/dist/van11y-accessible-hide-show-aria.js',
        'node_modules/van11y-accessible-modal-tooltip-aria/dist/van11y-accessible-modal-tooltip-aria.js',
        'node_modules/swiper/swiper-bundle.js',
        'dev/js/accordion.js',
        'node_modules/@10up/component-tabs/dist/index.umd.js',
        'node_modules/a11y-dialog/dist/a11y-dialog.js',
        "dev/js/timelify.js",
        "node_modules/imagesloaded/imagesloaded.pkgd.min.js",
        "node_modules/masonry-layout/dist/masonry.pkgd.min.js",
        'dev/js/app.js'
        // 'dev/js/jquery.ihavecookies.js',
        // 'dev/js/ihavecookies.js',
      ]

    },
    imgFiles: [
      'dev/img/**/*.+(png|jpg|jpeg|gif|svg|webp)',
      //'!dev/img/sprites-svg/*'
    ],

    svgFiles: [
      'dev/img/**/*.svg',
      //'!dev/img/sprites-svg/*',
    ],

    imgcssFiles: [
      'dev/css/img/**/*.+(png|jpg|jpeg|gif|svg|webp)',
      '!dev/css/img/sprites/*',
      '!dev/css/img/sprites-svg/*'
    ],

    svgcssFiles: [
      'dev/css/img/**/*.svg',
      '!dev/css/img/sprites-svg/*'
    ],

    fontFiles: [
      'node_modules/@accessible360/accessible-slick/slick/fonts/**/*',
      'dev/fonts/**/*',
      'dev/fonts/*'
    ],

    googleFonts: {
      // Fons a descarregar de google
      'Archivo': [
        '300',
        '400',
        '400italic',
        '500',
        '500italic',
        '600',
        '700',
        '800',
        '900',
      ]
    },

    sassIncludePaths: [
      'node_modules/'
    ]
  };
  return config;
};
