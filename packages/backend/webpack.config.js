const webpack = require('webpack');
const path = require('path');

module.exports = function (options, webpack) {
  return {
    ...options,
    externals: {
      // Exclude database drivers from bundling
      'tedious': 'commonjs tedious',
      'pg': 'commonjs pg',
      'pg-hstore': 'commonjs pg-hstore',
      'mysql2': 'commonjs mysql2',
      'mysql': 'commonjs mysql',
      'sqlite3': 'commonjs sqlite3',
      'oracledb': 'commonjs oracledb',
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          // Ignore database drivers that aren't installed
          const lazyImports = [
            'pg-hstore',
            'pg-native',
            'pg-query-stream',
            'sqlite3',
            'oracledb',
            'redis',
            'tedious',
            'ibm_db',
            'snowflake-sdk',
          ];

          if (!lazyImports.includes(resource)) {
            return false;
          }

          try {
            require.resolve(resource, {
              paths: [process.cwd()]
            });
          } catch (err) {
            return true;
          }
          return false;
        },
      }),
    ],
  };
};