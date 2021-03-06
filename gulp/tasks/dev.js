// Variable Initilization
var gulp = require('gulp'),
watch = require('gulp-watch'),
browserSync = require('browser-sync').create(),
postcss = require('gulp-postcss'),
autoprefixer = require('autoprefixer'),
cssvars = require('postcss-simple-vars'),
nested = require('postcss-nested'),
cssImport = require('postcss-import'),
mixins = require('postcss-mixins'),
hexrgba = require('postcss-hexrgba'),
webpack = require('webpack'),
svgSprite = require('gulp-svg-sprite'),
rename = require('gulp-rename'),
del = require('del');

// Tasks
gulp.task('watch', function(){
  
  browserSync.init({
    notify: false,
    server: {
      baseDir: "app"
    }
  });

  watch('./app/assets/styles/**/*.css', gulp.series(styles, css_inject));
  watch('./app/assets/scripts/**/*.js', gulp.series(scripts, browserReload));

  watch('./app/*.html', browserReload);

});

gulp.task('sprites', gulp.series(delSprite, createSprite, copySpriteCSS));

gulp.task('scripts', scripts);
gulp.task('styles', styles);

// Functions

// styles
function styles() {
  return gulp.src('./app/assets/styles/styles.css')
    .pipe(postcss([cssImport, mixins, cssvars, hexrgba, nested, autoprefixer]))
		.on('error', function(errorInfo){
			console.log(errorInfo.toString());
			this.emit('end');
    })    
    .pipe(gulp.dest('./app/temp/styles'));
}

function css_inject() {
  return gulp.src('./app/temp/styles/styles.css')
    .pipe(browserSync.stream());
}

// scripts

function scripts(callback) {
  webpack(require('../../webpack.config'), function(err, stats) {
    if (err) {
      console.log(err.toString())
    }  
    console.log(stats.toString());
    callback();
  });
}

// sprites
var config = {
  mode: {
    css: {
      render: {
        css: {
          template: './gulp/templates/sprite.css'
        }
      }
    }
  }
}

function createSprite() {
  return gulp.src('./app/assets/images/icons/**/*.svg')
    .pipe(svgSprite(config))
    .pipe(gulp.dest('./app/assets/images/sprites/'));
}

function copySpriteCSS() {
  return gulp.src('./app/assets/images/sprites/css/*.css')
    .pipe(rename('_sprite.css'))
    .pipe(gulp.dest('./app/assets/styles/modules'));
}

function delSprite() {
 return del('./app/assets/images/sprites/');
}

// for html and scripts reload
function browserReload() {
  browserSync.reload();
}