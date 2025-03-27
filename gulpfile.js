const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const rename = require("gulp-rename");
const htmlmin = require("gulp-htmlmin");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const terser = require("gulp-terser");
const sync = require("browser-sync").create();

// Styles

const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// HTML min

const html = () => {
    return gulp.src("source/*.html")
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest("build"));
}

exports.html = html;

// Scripts

const scripts = () => {
    return gulp.src("source/js/*.js")
        .pipe(gulp.dest("build/js"))
        .pipe(terser())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest("build/js"))
        .pipe(sync.stream());
}

exports.scripts = scripts;

// Image optimization

const images = () => {
    return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
        imagemin.optipng({optimizationLevel: 3}),
        imagemin.mozjpeg({progressive: true}),
        imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"))
}

exports.images = images;

// Webp

const createWebp = () => {
    return gulp.src("source/img/**/*.{jpg,png}")
        .pipe(webp({quality: 90}))
        .pipe(gulp.dest("build/img"))
}

exports.createWebp = createWebp;

// Svgstore, svg sprite

const sprite = () => {
    return gulp.src("source/img/**/icon-*.svg")
        .pipe(svgstore())
        .pipe(rename("sprite.svg"))
        .pipe(gulp.dest("build/img"));
}

exports.sprite = sprite;

// Clean before copy to build

const clean = () => {
    return del("build");
}; 

exports.clean = clean;

// Copy to build

const copy = (done) => {
    gulp.src([
        "source/fonts/*.{woff2,woff}",
        "source/*.ico",
        "source/img/**/*.{jpg,png,svg}",
    ], {
        base: "source"
    })
    .pipe(gulp.dest("build"))
    done();
}

exports.copy = copy;

// To build

const build = gulp.series(
    clean,
    copy,
    images,
    gulp.parallel(
      styles,
      sprite,
      html,
      scripts,
      createWebp
    )
)

exports.build = build;


// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/*.html", gulp.series("html"));
}

exports.default = gulp.series(
  styles, server, watcher
);
