var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
// var html2js = require(gulp-html2js);


gulp.task('server', function () {
    plugins.connect.server({
        host:'10.33.96.40',
        port: 8080,
        root:['/','./'],
        middleware: function (connect,opt) {
            return [];
        }
    });
});

var project = 'euro2';
// var project = 'sign';
// var activity = 'sign';

//清理
gulp.task('clean',function(){
    return gulp.src([
        'dest/*',
        '!dest/sftp-config.json'
    ],{read:false})
        .pipe(plugins.clean());
});

//压缩JS
gulp.task('js', function(){
    return gulp.src(['apps/'+project+'/scripts/*.js'])
        .pipe(plugins.concat('all.js'))
        .pipe(gulp.dest('dest/'+project+'/scripts/'))
        .pipe(plugins.uglify({
            mangle: false
        }))
        .pipe(plugins.rename('all.min.js'))
        .pipe(plugins.rev())
        .pipe(gulp.dest('dest/'+project+'/scripts/'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest('dest/'+project+'/version/scripts'));
});

//framework
gulp.task('framework',function(){
    return gulp.src(['node_modules/angular/angular.min.js',
        'node_modules/angular-ui-router/release/angular-ui-router.min.js',
        'node_modules/angular-cookies/angular-cookies.min.js',
        'apps/public/scripts/lib/layer/layer.js',
        'apps/public/scripts/lib/swiper/swiper-3.3.1.min.js'
    ])
        .pipe(plugins.concat('framework.js'))
        .pipe(gulp.dest('dest/'+project+'/framework'))
        .pipe(plugins.uglify())
        .pipe(plugins.rename('framework.min.js'))
        .pipe(plugins.rev())
        .pipe(gulp.dest('dest/'+project+'/framework/'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest('dest/'+project+'/version/framework'));
});
//压缩css
gulp.task('css',function(){
    return gulp.src([
        'apps/public/scripts/lib/swiper/swiper-3.3.1.min.css',
        'apps/public/css/layout.css',
        'apps/public/scripts/lib/layer/layer.css',
        'apps/'+project+'/css/*.css'])
        .pipe(plugins.concat('all.min.css'))
        .pipe(plugins.minifyCss())
        .pipe(plugins.rev())
        .pipe(gulp.dest('dest/'+project+'/css/'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest('dest/'+project+'/version/css/'));
    //.pipe(gulp.dest('dest/css'));
});

gulp.task('md5',function(){
    return gulp.src([
        'apps/public/scripts/lib/md5/md5.js'
    ])
        .pipe(gulp.dest('dest/'+project+'/framework/'));
})
//压缩HTML
gulp.task('html',function(){
    return gulp.src(['apps/'+project+'/views/**'])
        .pipe(plugins.minifyHtml())
        .pipe(gulp.dest('dest/'+project+'/views'));
});
//压缩index.html
gulp.task('index',function(){
    var assets = plugins.useref.assets();

    return gulp.src(['apps/'+project+'/index.html'])
        .pipe(assets)
        .pipe(assets.restore())
        .pipe(plugins.useref())
        // .pipe(plugins.minifyHtml())
        .pipe(gulp.dest('dest/'+project+'/'));
});
//版本号
gulp.task('dev',['index','css','js','html','framework'],function(){
    return gulp.src(['dest/'+project+'/version/**/*.json','dest/'+project+'/index.html'])
        .pipe(plugins.revCollector({
            replaceReved:true
        })
    )
        .pipe(gulp.dest('dest/'+project+'/'));
});


gulp.task('images',function(){
    return gulp.src(['apps/'+project+'/images/*','apps/'+project+'/images/**/*'])
        .pipe(gulp.dest('dest/'+project+'/images/'));
});





gulp.task('act-js',function(){
    return gulp.src([
        'apps/activities/'+project+'/scripts/*.js',
        'apps/public/scripts/lib/activity/api.js'
    ])
        .pipe(plugins.concat('all.js'))
        .pipe(gulp.dest('dest/activities/'+project+'/scripts/'))
        .pipe(plugins.uglify({
            mangle: false
        }))
        .pipe(plugins.rename('all.min.js'))
        .pipe(plugins.rev())
        .pipe(gulp.dest('dest/activities/'+project+'/scripts/'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest('dest/activities/'+project+'/version/scripts'));
})
gulp.task('act-framework',function(){
    return gulp.src(['node_modules/angular/angular.min.js',
        // 'node_modules/angular-ui-router/release/angular-ui-router.min.js',
        'node_modules/angular-cookies/angular-cookies.min.js',
        'apps/public/scripts/lib/layer/layer.js',
        // 'apps/public/scripts/lib/swiper/swiper-3.3.1.min.js'
    ])
        .pipe(plugins.concat('framework.js'))
        .pipe(gulp.dest('dest/activities/'+project+'/framework'))
        .pipe(plugins.uglify())
        .pipe(plugins.rename('framework.min.js'))
        .pipe(plugins.rev())
        .pipe(gulp.dest('dest/activities/'+project+'/framework/'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest('dest/activities/'+project+'/version/framework'));
});
gulp.task('act-css',function(){
    return gulp.src([
        // 'apps/public/scripts/lib/swiper/swiper-3.3.1.min.css',
        'apps/public/css/layout.css',
        'apps/public/scripts/lib/layer/layer.css',
        'apps/activities/'+project+'/css/*.css'])
        .pipe(plugins.concat('all.min.css'))
        .pipe(plugins.minifyCss())
        .pipe(plugins.rev())
        .pipe(gulp.dest('dest/activities/'+project+'/css/'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest('dest/activities/'+project+'/version/css/'));
    //.pipe(gulp.dest('dest/css'));
});
gulp.task('act-md5',function(){
    return gulp.src([
        'apps/public/scripts/lib/md5/md5.js',
        'apps/public/scripts/lib/appcall/appcall.js'
    ])
        .pipe(gulp.dest('dest/activities/'+project+'/framework/'));
})

gulp.task('act-html',function(){
    return gulp.src(['apps/activities/'+project+'/views/**'])
        .pipe(plugins.minifyHtml())
        .pipe(gulp.dest('dest/activities/'+project+'/views'));
});
//压缩index.html
gulp.task('act-index',function(){
    var assets = plugins.useref.assets();

    return gulp.src(['apps/activities/'+project+'/*.html'])
        .pipe(assets)
        .pipe(assets.restore())
        .pipe(plugins.useref())
        // .pipe(plugins.minifyHtml())
        .pipe(gulp.dest('dest/activities/'+project+'/'));
});
//版本号
gulp.task('act-dev',['act-index','act-css','act-js','act-html','act-framework'],function(){
    return gulp.src(['dest/activities/'+project+'/version/**/*.json','dest/activities/'+project+'/*.html'])
        .pipe(plugins.revCollector({
            replaceReved:true
        })
    )
        .pipe(gulp.dest('dest/activities/'+project+'/'));
});


gulp.task('act-images',function(){
    return gulp.src(['apps/activities/'+project+'/images/*','apps/activities/'+project+'/images/**/*'])
        .pipe(gulp.dest('dest/activities/'+project+'/images/'));
});


gulp.task('default',['js','md5','html','css','images','framework','index','dev']);
gulp.task('hd',['act-js','act-md5','act-html','act-css','act-images','act-framework','act-index','act-dev']);

