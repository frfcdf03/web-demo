var gulp = require('gulp');
var connect= require('gulp-connect');
var proxy   = require('http-proxy-middleware');


gulp.task('hrframe',function(){
    gulp.src(["web/*","web/**/*"])
        .pipe(gulp.dest('dist/'));
    gulp.src(["src/*","src/**/*"])
        .pipe(gulp.dest('dist/app'));
    gulp.src(["doc/*","doc/**/*"])
        .pipe(gulp.dest('dist/doc'));
});

gulp.task('watch',function() {
    gulp.watch(['src/*','src/**/*','web/*','web/**/*','doc/*',"doc/**/*"], ['hrframe']);
});

gulp.task('server', function(done) {
    connect.server({
        port:'3000',
        root:'dist',
        livereload:false,
        middleware: function(connect, opt) {
            var backend = proxy('/proxy',{
                target:'http://localhost:4000',
                changeOrigin:true,
                pathRewrite:{'/proxy/':''}
            });
            return [backend];
        }
    });
});

gulp.task("default",['hrframe','watch','server']);
