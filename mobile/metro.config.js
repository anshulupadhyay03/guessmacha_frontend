const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const projectRoot = __dirname;
const sharedRoot = path.resolve(projectRoot, '../shared');

const config = {
  watchFolders: [sharedRoot],

  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(__dirname, '../node_modules'),
    ],
  },
};

module.exports = mergeConfig(
  getDefaultConfig(projectRoot),
  config,
);