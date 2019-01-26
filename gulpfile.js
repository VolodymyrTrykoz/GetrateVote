let gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    bourbon = require('node-bourbon'),
    ftp = require('vinyl-ftp'),
    notify = require('gulp-notify'),
    nunjucksRender = require('gulp-nunjucks-render'),
    babel = require('gulp-babel'),
    axios = require('axios');

// Скрипты проекта
gulp.task('scripts', () => {
    return gulp.src([
        'app/js/jsEs5.js',
    ])
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/js'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('babel', () => {
    return gulp.src('app/js/main.js')
        .pipe(babel({presets: ['env']}))
        .pipe(concat('jsEs5.js'))
        .pipe(gulp.dest('app/js'))
});

gulp.task('buildJs', ['babel'], () => {
    gulp.start('scripts');
});

gulp.task('nunjucks', function () {
    return gulp.src('app/pages/**/*.+(html|nunjucks)')
        .pipe(nunjucksRender({
            path: ['app/templates']
        }))
        .pipe(gulp.dest('app'))
});

gulp.task('browser-sync', () => {
    browserSync({
        server: {
            baseDir: 'app'
        },
        https: true,
        notify: false,
        ghostMode: false
    });
});

gulp.task('sass', () => {
    return gulp.src('app/sass/**/*.sass')
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: bourbon.includePaths
        }).on("error", notify.onError()))
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', ['nunjucks', 'nunjucks', 'sass', 'buildJs', 'browser-sync'], () => {
    gulp.watch('app/templates/**/*.+(html|nunjucks)', ['nunjucks']);
    gulp.watch('app/pages/**/*.+(html|nunjucks)', ['nunjucks']);
    gulp.watch('app/sass/**/*.sass', ['sass']);
    gulp.watch('app/js/main.js', ['buildJs']);
    gulp.watch('app/*.html', browserSync.reload);
});

gulp.task('imagemin', () => {
    return gulp.src('app/img/**/*')
        .pipe(cache(imagemin()))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('build', ['removedist', 'imagemin', 'sass', 'babel', 'scripts'], () => {

    var buildFiles = gulp.src([
        'app/*.html',
        'app/.htaccess'
    ]).pipe(gulp.dest('dist'));

    var buildCss = gulp.src([
        'app/*.css'
    ]).pipe(gulp.dest('dist/css'));

    var buildJs = gulp.src([
        'app/js/scripts.min.js'
    ]).pipe(gulp.dest('dist/js'));

    var buildFonts = gulp.src([
        'app/fonts/**/*']
    ).pipe(gulp.dest('dist/fonts'));
});

gulp.task('deploy', () => {
    var conn = ftp.create({
        host: 'hostname.com',
        user: 'username',
        password: 'userpassword',
        parallel: 10,
        log: gutil.log
    });

    var globs = [
        'dist/**',
        'dist/.htaccess',
    ];
    return gulp.src(globs, {buffer: false})
        .pipe(conn.dest('/path/to/folder/on/server'));

});

gulp.task('removedist', () => {
    return del.sync('dist')
});
gulp.task('clearcache', () => {
    return cache.clearAll()
});

gulp.task('default', ['watch']);