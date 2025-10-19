const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude problematic directories from Metro bundler
config.resolver.blockList = [
  // Block Android Studio files that cause permission errors
  /.*\/AppData\/Local\/Google\/AndroidStudio.*/,
  /.*\/\.port$/,
];

// Additional watchman configuration to ignore problematic paths
config.watchFolders = config.watchFolders || [];
config.watchFolders = config.watchFolders.filter(folder => 
  !folder.includes('AppData/Local/Google/AndroidStudio')
);

module.exports = config;
