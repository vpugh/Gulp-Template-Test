var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var nunjucksRender = require('gulp-nunjucks-render');
var data = require('gulp-data');
var useref = require('gulp-useref');
var del = require('del');
var runSequence = require('run-sequence');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var sourcemaps = require('gulp-sourcemaps');

// Start server
gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: 'app'
		},
	})
})

// Error Handler
var onError = function (err) {
	notify.onError({
		title: 'Compile Error',
		message: '<%= error.message %>'
	})(err);
	this.emit('end');
}

// Compiling Sass into CSS
gulp.task('sass', function(){
  return gulp.src('app/scss/**/*.scss')
  	.pipe(plumber({ errorHandler: onError }))
  	.pipe(sourcemaps.init())
    .pipe(sass()) // Converts Sass to CSS with gulp-sass
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
	    stream: true
    }));
});

// Templating
gulp.task('nunjucks', function() {
	// Gets .html and .nunjucks files in pages
	return gulp.src('app/pages/**/*.+(html|nunjucks)')
		.pipe(plumber({ errorHandler: onError }))
		// Pulls data from json file
		.pipe(data(function() {
			return require('./app/data.json')
		}))
		// Renders template with nunjucks
		.pipe(nunjucksRender({
			path: ['app/templates']
		}))
		// Output files in app folder
		.pipe(gulp.dest('app'))
});

gulp.task('watch', ['nunjucks', 'browserSync', 'sass'], function() {
	gulp.watch('app/scss/**/*.scss', ['sass']);
	gulp.watch('app/**/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
	gulp.watch(['app/templates/**/*.nunjucks', 'app/pages/**/*.nunjucks'], ['nunjucks'], browserSync.reload);
});


/// 
// Build Portion
///

// delete dist folder
gulp.task('clean:dist', function() {
	return del.sync('dist');
});


// Copy files over into dist folder
gulp.task('useref', function() {
	return gulp.src('app/**/*.html')
	.pipe(plumber({ errorHandler: onError }))
	.pipe(useref())
	.pipe(gulpIf('*.js', uglify()))
	.pipe(gulpIf('*.css', cssnano()))
	.pipe(gulp.dest('dist'))
});

// Delete folder, compile sass, copy files over into dist folder
gulp.task('build', function(callback) {
	runSequence('clean:dist',
		['sass', 'nunjucks', 'useref'],
		callback)
});