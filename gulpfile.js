var gulp = require('gulp')
  , uglify = require('gulp-uglify')
  , rename = require('gulp-rename')
  , envify = require('envify/custom')
  , transform = require('vinyl-transform');

gulp.task('build:dev', function() {
  return gulp.src('lib/react-onoutsideevent.js')
    .pipe(transform(envify({ NODE_ENV: 'development' })))
    .pipe(gulp.dest('dist'));
});

gulp.task('build:prod', function() {
  return gulp.src('lib/react-onoutsideevent.js')
    .pipe(transform(envify({ NODE_ENV: 'production' })))
    .pipe(uglify())
    .pipe(rename(function (path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['build:dev', 'build:prod']);
