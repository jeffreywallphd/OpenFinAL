const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path');

const CopyDependenciesPlugin = require('./forge-plugins');

module.exports = {
  packagerConfig: {
    name: 'OpenFinAL',
    executableName: 'OpenFinAL',
    asar: true,
    asarUnpack: [
      '**/*.node',
      '**/better-sqlite3/**',
      '**/sqlite3/**',
      '**/keytar/**',
    ],
    icon: path.resolve(__dirname, 'src/Asset/Image/icon'),
    extraResource: [
      path.resolve(__dirname, 'src/Asset/Slideshows'),
      path.resolve(__dirname, 'src/Asset/LearningModulesVoiceovers'),
    ],
  },
  rebuildConfig: {
    buildPath: './',
    electronRebuildConfig: {
      force: true,
    },
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'OpenFinAL',
        shortcutName: 'OpenFinAL',
        setupExe: 'OpenFinAL-Setup.exe',
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          name: 'openfinal',
          productName: 'OpenFinAL',
          genericName: 'Financial Analytics',
          description: 'An AI-enabled software to learn financial investing',
          categories: ['Finance', 'Education'],
          icon: path.resolve(__dirname, 'src/Asset/Image/icon.png'),
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          name: 'openfinal',
          productName: 'OpenFinAL',
          description: 'An AI-enabled software to learn financial investing',
          categories: ['Finance', 'Education'],
          icon: path.resolve(__dirname, 'src/Asset/Image/icon.png'),
        },
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    },
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.js',
              name: 'main_window',
              preload: {
                js: './src/preload.js',
              },
            },
          ],
        },
      },
    },
    new CopyDependenciesPlugin(),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false, //temporarily set to false, change to true later
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
