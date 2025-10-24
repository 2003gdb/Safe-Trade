module.exports = function (options) {
  return {
    ...options,
    externals: {
      'mysql2': 'commonjs mysql2',
    },
  };
};