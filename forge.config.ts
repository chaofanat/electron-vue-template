import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { cpSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

/**
 * Recursively finds all .node files in node_modules.
 * Returns absolute paths to each native binary found.
 */
function findNativeModules(rootDir: string): string[] {
  const nativeFiles: string[] = [];
  const skipDirs = ['electron', '@rollup', '@electron-forge', 'vite'];

  function walk(dir: string): void {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      if (entry.startsWith('.')) continue;
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        if (entry === 'node_modules' || !skipDirs.includes(entry)) {
          walk(full);
        }
      } else if (entry.endsWith('.node')) {
        nativeFiles.push(full);
      }
    }
  }

  walk(rootDir);
  return nativeFiles;
}

/**
 * Copies native module packages to <buildOutput>/resources/node_modules/.
 * Called by the postPackage hook after Forge finishes packaging.
 */
function copyNativeModules(projectRoot: string, buildPath: string): void {
  const nodeModulesDir = join(projectRoot, 'node_modules');
  const nativeFiles = findNativeModules(nodeModulesDir);

  if (nativeFiles.length === 0) return;

  console.log(`[postPackage] Found ${nativeFiles.length} native module(s), copying to resources/...`);

  for (const nativeFile of nativeFiles) {
    const relPath = relative(projectRoot, nativeFile);
    // Find the package root (the directory directly under node_modules/)
    const parts = relPath.split(/[/\\]/);
    const packageRootIndex = parts.indexOf('node_modules') + 1;
    // Handle scoped packages like @scope/package
    const packageRootParts = parts[packageRootIndex].startsWith('@')
      ? packageRootIndex + 2
      : packageRootIndex + 1;
    const packageRelPath = parts.slice(0, packageRootParts).join('/');
    const packageAbsPath = join(projectRoot, packageRelPath);
    const destPackagePath = join(buildPath, 'resources', packageRelPath);

    if (!existsSync(destPackagePath)) {
      console.log(`[postPackage] Copying ${packageRelPath} -> resources/${packageRelPath}`);
      cpSync(packageAbsPath, destPackagePath, {
        recursive: true,
        filter: (src) => {
          const basename = src.split(/[/\\]/).pop() || '';
          return !['test', 'tests', 'docs', '.github', 'benchmark'].includes(basename);
        },
      });
    }
  }
}

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    // [TEMPLATE] Change these to match your application name before publishing
    name: 'Electron Vue App',
    executableName: 'electron-vue-app',
  },
  makers: [
    new MakerSquirrel({
      setupIcon: './resources/icon.ico',
    }),
    new MakerZIP({}, ['win32', 'darwin', 'linux']),
    new MakerDeb({
      options: {
        maintainer: 'Developer',
        homepage: 'https://github.com/electron-vue-template',
      },
    }),
  ],
  hooks: {
    postPackage: async (_forgeConfig, packageResult) => {
      copyNativeModules(__dirname, packageResult.outputPaths[0]);
    },
  },
  plugins: [
    // AutoUnpackNativesPlugin configures ASAR to unpack .node files.
    // However, since Vite excludes node_modules from the package,
    // the postPackage hook above is needed to actually copy native modules.
    new AutoUnpackNativesPlugin({}),
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
        // [TEMPLATE] Worker thread entry — uncomment if you need worker threads.
        // See src/main/workers/example-worker.ts and vite.worker.config.ts.
        // {
        //   entry: 'src/main/workers/example-worker.ts',
        //   config: 'vite.worker.config.ts',
        //   target: 'main',
        // },
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
