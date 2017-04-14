const babel = require('rollup-plugin-babel')({
  babelrc: false,
  presets: [
    ['es2015-rollup'],
    'stage-0'
  ]
})
const alias = require('rollup-plugin-alias')

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: [
      'test/**/*.spec.js'
    ],
    exclude: [],
    preprocessors: {
      'test/**/*.spec.js': ['rollup']
    },
    rollupPreprocessor: {
      plugins: [
        babel,
        alias({
          'vue-mixin': require('path').resolve(__dirname, 'src/index')
        })
      ],
      format: 'cjs'
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    concurrency: Infinity
  })
}
