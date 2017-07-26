var gulp       	= require('gulp'), // Подключаем Gulp
	sass         = require('gulp-sass'), //Подключаем Sass пакет,
	browserSync  = require('browser-sync'), // Подключаем Browser Sync
	concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
	uglify       = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
	cssnano      = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
	rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
	del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
	imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
	pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
	cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
	autoprefixer = require('gulp-autoprefixer'),
	buffer 		 = require('vinyl-buffer'),
	merge 		 = require('merge-stream'),
	spritesmith  = require('gulp.spritesmith'),
	svgSprite 	 = require('gulp-svg-sprite'), //для свг спарйтов
 	svgmin 		 = require('gulp-svgmin'), //для свг спарйтов
 	cheerio 	 = require('gulp-cheerio'), //для свг спарйтов
	replace 	 = require('gulp-replace'); //для свг спарйтов


var assetsDir = 'app/';
var buildDir = 'markup/';

gulp.task('svg', function () {
	return gulp.src(assetsDir + 'images/sprites/*.svg')
	// minify svg
		.pipe(svgmin({
			js2svg: {
				pretty: true
			}
		}))
		// remove all fill and style declarations in out shapes
		.pipe(cheerio({
			run: function ($) {
				$('[fill]').removeAttr('fill');
				$('[stroke]').removeAttr('stroke');
				$('[style]').removeAttr('style');
			},
			parserOptions: {xmlMode: true}
		}))
		// cheerio plugin create unnecessary string '&gt;', so replace it.
		.pipe(replace('&gt;', '>'))
		// build svg sprite
		.pipe(svgSprite({
			dest : '.',
			mode : {
             symbol : {
                 dest : '.',
                 sprite : 'images/sprite.svg',
                 dimensions		: "-ico",
                 render: {
						scss: {
			 				dest:'sass/_sprite-svg.scss',
			 				template: assetsDir + "sass/sprite_template_svg/_sprite_template_svg.scss"
			 				
			 			}
			 		},
			 		example: true
             }
         }
		}))
		.pipe(gulp.dest('./app'));
});


//build sprites png
gulp.task('sprite', function () {
  var spriteData = gulp.src('app/images/sprites/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: '_sprite.scss',
    imgPath: '../images/sprite.png',
    padding: 5
  }));
  var imgStream = spriteData.img
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest('app/images/')); 
  var cssStream = spriteData.css
    .pipe(gulp.dest('app/sass'));
 
  return merge(imgStream, cssStream);
});


//библиотеки js
gulp.task('scripts', function() {
	return gulp.src([ // Берем все необходимые библиотеки
		'bower_components/jquery/dist/jquery.min.js', 
		'bower_components/owl.carousel/dist/owl.carousel.min.js',
		'bower_components/matchHeight/dist/jquery.matchHeight-min.js'
		])
		// .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
		// .pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});


//библиотеки css
gulp.task('css-libs', ['sass'], function() {
	return gulp.src([ // Берем все необходимые библиотеки
		'bower_components/owl.carousel/dist/assets/owl.carousel.css', 
		'bower_components/owl.carousel/dist/assets/owl.theme.default.css' 
		])
		.pipe(cssnano())
		.pipe(concat('libs.min.css')) // Собираем их в кучу в новом файле libs.min.css
		.pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
});

gulp.task('sass', function(){ // Создаем таск Sass
	return gulp.src('app/sass/**/*.scss') // Берем источник
		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError)) // Преобразуем Sass в CSS посредством gulp-sass
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
		.pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
		.pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
	browserSync({ // Выполняем browserSync
		server: { // Определяем параметры сервера
			baseDir: 'app' // Директория для сервера - app
		},
		notify: false // Отключаем уведомления
	});
});

gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function() { 
	// gulp.watch('app/sass/**/*.scss', ['sass']); // Наблюдение за sass файлами в папке sass
	gulp.watch('app/sass/**/*.scss', function(event, cb) {
        setTimeout(function(){gulp.start('sass');},500) // задача выполниться через 500 миллисекунд и файл успеет сохраниться на диске
    });
	gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
	gulp.watch('app/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
});

gulp.task('clean', function() {
	return del.sync('markup'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
	return gulp.src('app/images/**/*') // Берем все изображения из app
		.pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('markup/images')); // Выгружаем на продакшен
});

gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function() {

	var buildCss = gulp.src([ // Переносим библиотеки в продакшен
		'app/css/all.css',
		'app/css/libs.min.css'
		])
	.pipe(gulp.dest('markup/css'))

	var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
	.pipe(gulp.dest('markup/fonts'))

	var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
	.pipe(gulp.dest('markup/js'))

	var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
	.pipe(gulp.dest('markup'));
	

});

gulp.task('clear', function (callback) {
	return cache.clearAll();
})

gulp.task('dev', ['watch']);
