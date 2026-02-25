const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Ignore generated Android build outputs to prevent Metro watcher fd exhaustion.
    blockList: exclusionList([
      /.*[/\\]android[/\\]build[/\\].*/,
      /.*[/\\]android[/\\]app[/\\]build[/\\].*/,
      /.*[/\\]android[/\\]app[/\\]\.cxx[/\\].*/,
      /.*[/\\]node_modules[/\\].*[/\\]android[/\\]build[/\\].*/,
      /.*[/\\]node_modules[/\\].*[/\\]\.cxx[/\\].*/,
      /.*[/\\]node_modules[/\\].*[/\\]intermediates[/\\].*/,
    ]),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
