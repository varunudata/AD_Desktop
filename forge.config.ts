import type { ForgeConfig } from '@electron-forge/shared-types';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { MakerZIP } from '@electron-forge/maker-zip';

const config: ForgeConfig = {
  packagerConfig: {
    name: 'ClassFlow',
    executableName: 'ClassFlow',
    asar: true,
    appBundleId: 'com.classflow.app',
    appCategoryType: 'public.app-category.education',
  },
  rebuildConfig: {},
  makers: [
    new MakerZIP({}, ['darwin', 'win32', 'linux']),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main/index.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload/index.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
  ],
};

export default config;
