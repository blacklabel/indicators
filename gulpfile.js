'use strict';
var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    eslint = require('gulp-eslint');

gulp.task('lint', function () {
    return gulp.src(['js/*.js'])
        .pipe(eslint())
        .pipe(eslint.failOnError())
        .pipe(eslint.formatEach());
});