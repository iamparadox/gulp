/*
 * @namespace : gulpfile.babel.js
 * @contain : 封装'styles' scss植入 自动增加兼容前缀 css优化 监听更改
 * 			  封装'scripts' 支持 ES6 仅对JS压缩&加密 监听更改
 * 			  封装'html' 监听更改 压缩 html
 * 			  封装'images' 监听更改 图片压缩
 * @usage : 2017年06月17日
 * @madeby : paradox
 * gulp 执行
 * ctrl+c 退出编译
 */

'use strict';
// 加载非 Gulp-*插件
import gulp from 'gulp';
import del from 'del';
import browserSync from 'browser-sync';
import runSequence from 'gulp-run-sequence';

// 加载自动加载插件,来源 package.json
const plugins = require('gulp-load-plugins')();

// 浏览器关联 IDE同步
const reload = browserSync.reload;

// jquery引入
const $ = require('jquery');

// 开发目录 src  开发环境 tmp  生产环境 dist
const $root = {
	styles : {
		src : ['assets/css/lib/**.css','assets/css/**.*'],
		tmp : './tmp/css',
		dist : './dist/css'
	},
	scripts : {
		src : 'assets/js/**.js',
		tmp : './tmp/js',
		dist : './dist/js'
	},
	html : {
		src : 'assets/html/**.html',
		tmp : './tmp',
		dist : './dist'
	},
	images : {
		src : 'assets/images/**.*',
		tmp : './tmp/images',
		dist : './dist/images'
	},
	lib : {
		src : ['assets/js/lib/**.js',],
		tmp : './tmp/lib',
		dist : './dist/lib'
	}

}


const $reloadMdl = ['html','lib','styles','scripts','images'];

//暂时不加sourseMap
//css样式处理
gulp.task('styles',['clean'],() => {
	return gulp.src($root.styles.src)
	.pipe(plugins.plumber())
	.pipe(plugins.changed('dist'))
	.pipe(plugins.sass.sync({
		outputStyle : 'compressed',
		precision : 10,
		indetedSyntax : 'true'
	}).on('error',plugins.sass.logError))
	.pipe(plugins.concat('main.min.css'))
	.pipe(plugins.autoprefixer({
		browsers : ['last 2 versions'],
		cascade : true,
		remove : true,
	}))
	.pipe(gulp.dest($root.styles.tmp))
	.pipe(plugins.if('*.css',plugins.cssnano()))
	.pipe(gulp.dest($root.styles.tmp))
	.pipe(gulp.dest($root.styles.dist))
	.pipe(reload({stream : true}));
});

//js处理
gulp.task('scripts',['clean'],() => {
	return gulp.src($root.scripts.src)
	.pipe(plugins.plumber())
	.pipe(plugins.babel())
	.pipe(gulp.dest($root.scripts.tmp))
	.pipe(plugins.concat('main.min.js'))
	.pipe(plugins.changed('./dist'))
	.pipe(plugins.uglify())
	.pipe(gulp.dest($root.scripts.tmp))
	.pipe(gulp.dest($root.scripts.dist))
	.pipe(reload({stream : true}));
});

//html处理
gulp.task('html',['clean'],() => {
	return gulp.src($root.html.src)
	.pipe(plugins.changed('./tmp'))
	.pipe(plugins.if('*.html',plugins.htmlmin({
		removeComments : true,//清除HTML注释
      	collapseWhitespace : true,//压缩HTML
      	collapseBooleanAttributes : true,
      	removeEmptyAttributes : true,
      	removeScriptTypeAttributes : true,
      	removeStyleLinkTypeAttributes : true
	})))
	.pipe(gulp.dest($root.html.tmp))
	.pipe(gulp.dest($root.html.dist))
	.pipe(reload({stream : true}));
});

//图片处理
gulp.task('images',['clean'],() => {
	return gulp.src($root.images.src)
	.pipe(plugins.imagemin([
		plugins.imagemin.gifsicle({interlaced: true}),
    	plugins.imagemin.jpegtran({progressive: true}),
    	plugins.imagemin.optipng({optimizationLevel: 1}),
    	plugins.imagemin.svgo({plugins: [{removeViewBox: true}]})
	]))
	.pipe(gulp.dest($root.images.tmp))
	.pipe(gulp.dest($root.images.dist))
	// .pipe(reload({stream : true}));
});

gulp.task('lib',['clean'],() => {
	return gulp.src($root.lib.src)
	.pipe(gulp.dest($root.lib.tmp))
	.pipe(gulp.dest($root.lib.dist))
});

// 预检&清除历史生成文件
gulp.task('clean',() => {
	return del(['./tmp', './dist']);
});

// 监听更改 浏览器刷新 生产环境
gulp.task('serve',$reloadMdl,() => {
	// 启动根目录 默认端口3000
	browserSync.init({
		server : {
			baseDir : './tmp'
		}
	});
	// 事件监听，live重载
	gulp.watch($root.html.src, $reloadMdl);
	gulp.watch($root.images.src, $reloadMdl);
	gulp.watch($root.styles.src,$reloadMdl);
	gulp.watch($root.scripts.src,$reloadMdl);

});

gulp.task('default',() => {
	return gulp.start('serve');
});
