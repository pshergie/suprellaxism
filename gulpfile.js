const { src, dest, parallel } = require('gulp');
const minifyCSS = require('gulp-csso');
const minify = require('gulp-minify');

function css() {
  return src('src/css/*.css')
    .pipe(minifyCSS())
    .pipe(dest('docs/css'))
}

function js() {
  return src('src/js/*.js')
    .pipe(minify())
    .pipe(dest('docs/js'))
}

exports.js = js;
exports.css = css;
exports.default = parallel(css, js);
