module.exports = {
  // parser: 'sugarss',
  plugins: {
    'postcss-import': {},
    'postcss-nested': {},
    'postcss-adaptive': {
      remUnit: 75,
      autoRem: true,
    },
    'autoprefixer': {},
  },
}