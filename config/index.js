const config = {
  projectName: 'dailyhappy',
  date: '2018-11-28',
  designWidth: 750,
  sourceRoot: 'src',
  outputRoot: 'dist',
  defineConstants: {
  },
  framework: 'react',
  mini: {
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    module: {
      postcss: {
        autoprefixer: {
          enable: true
        }
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
