const gulp = require('gulp')
const eslint = require('gulp-eslint')
const clear = require('clear')
const { rollup } = require('rollup')
const babel = require('rollup-plugin-babel')({
  babelrc: false,
  presets: [
    ['es2015-rollup'],
    'stage-0'
  ]
})
const uglify = require('rollup-plugin-uglify')
const { minify } = require('uglify-js')
const replace = require('rollup-plugin-replace')

const moduleName = 'VueMixin'
const destName = 'vue-mixin'

gulp.task('lint', () => {
  clear()
  return gulp.src(['**/*.js', '!node_modules/**', '!dist/**'])
    .pipe(eslint())
    .pipe(eslint.format())
})

gulp.task('build', () => {
  // Development environment version
  return rollup({
    entry: 'src/index.js',
    plugins: [babel],
    external: ['vue']
  }).then((bundle) => {
    return bundle.write({
      moduleName,
      format: 'cjs',
      dest: `dist/${destName}.js`,
      sourceMap: true,
      exports: 'named'
    })
  }).then(() => {
    // Production environment version
    return rollup({
      entry: 'src/index.js',
      plugins: [
        babel,
        replace({
          'process.env.NODE_ENV': JSON.stringify('production')
        }),
        uglify({
          compress: {
            drop_debugger: true,
            drop_console: true
          }
        }, minify)
      ],
      external: ['vue']
    })
  }).then((bundle) => {
    return bundle.write({
      moduleName,
      format: 'cjs',
      dest: `dist/${destName}.min.js`,
      sourceMap: true,
      exports: 'named'
    })
  })
})

gulp.task('default', ['lint', 'build'])

if (process.env.NODE_ENV !== 'production') {
  gulp.watch(['**/*.js', '!node_modules/**', '!dist/**'], ['lint', 'build'])
}
