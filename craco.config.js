const webpack = require('webpack');
const path = require('path');

const debugBrowserPath = require.resolve('debug/src/browser.js');
const ttyShimPath = path.resolve(__dirname, 'src/shims/tty.js');
const babelLoggerShimPath = path.resolve(__dirname, 'src/shims/babel-core-logger.js');

module.exports = {
  webpack: {
    configure: (config) => {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        // babel-core@6 imports debug/node; force browser implementation.
        debug$: debugBrowserPath,
        'debug/node': debugBrowserPath,
        'debug/node.js': debugBrowserPath,
        'debug/src/node': debugBrowserPath,
        'debug/src/node.js': debugBrowserPath,
        'babel-core/lib/transformation/file/logger': babelLoggerShimPath,
        'babel-core/lib/transformation/file/logger.js': babelLoggerShimPath,
        tty: ttyShimPath,
      };
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        assert: require.resolve('assert/'),
        buffer: require.resolve('buffer/'),
        fs: false,
        module: false,
        net: false,
        os: false,
        path: require.resolve('path-browserify'),
        process: require.resolve('process/browser'),
        stream: require.resolve('stream-browserify'),
        tls: false,
        tty: ttyShimPath,
        util: require.resolve('util/'),
      };

      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        (warning) => {
          const message = typeof warning === 'string' ? warning : warning?.message || '';
          const details = typeof warning === 'string' ? '' : warning?.details || '';
          const resource = warning?.module?.resource || '';
          const combined = `${message}\n${details}\n${resource}`;

          if (
            /Critical dependency: the request of a dependency is an expression/.test(message) &&
            /node_modules[\\/](babel-core|unwinder-engine)/.test(combined)
          ) {
            return true;
          }

          if (
            /Failed to parse source map/.test(message) &&
            /node_modules[\\/]console-feed/.test(combined)
          ) {
            return true;
          }

          return false;
        },
      ];

      config.plugins = [
        ...(config.plugins || []),
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: ['process'],
        }),
      ];

      return config;
    },
  },
};
