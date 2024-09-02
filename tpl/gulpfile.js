const gulp = require('gulp');

require('gulp-load-subtasks')('dev/tasks.js');

gulp.task('default', gulp.series('generate'));
