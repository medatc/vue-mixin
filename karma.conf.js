const path = require('path')
const babel = require('rollup-plugin-babel')
const alias = require('rollup-plugin-alias')
const replace = require('rollup-plugin-replace')

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: [
      'https://cdn.bootcss.com/chai/4.0.0-canary.1/chai.js',
      'https://cdn.bootcss.com/vue/2.2.6/vue.js',
      'https://cdn.bootcss.com/vue-router/2.4.0/vue-router.js',
      'test/**/*.test.js'
    ],
    exclude: [],
    preprocessors: {
      'test/**/*.test.js': ['rollup', 'eslint']
    },
    rollupPreprocessor: {
      plugins: [
        babel({
          babelrc: false,
          presets: [
            ['es2015-rollup'],
            'stage-0'
          ]
        }),
        alias({
          'vue-mixin': path.resolve(__dirname, 'src/index'),
          'utils': path.resolve(__dirname, 'test/utils/index.js'),
        }),
        replace({
          'process.env.NODE_ENV': JSON.stringify('development')
        })
      ],
      format: 'cjs',
      sourceMap: false
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
