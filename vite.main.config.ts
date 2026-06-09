import { defineConfig } from 'vite';
import { resolve } from 'path';

// Node.js built-in modules available at runtime in Electron's main process.
// These should not be bundled by Vite.
const nodeBuiltins = [
  'path', 'fs', 'os', 'crypto', 'stream', 'http', 'https',
  'url', 'util', 'assert', 'child_process', 'events', 'buffer',
  'net', 'tls', 'dns', 'zlib', 'tty', 'constants',
  'worker_threads', 'perf_hooks',
];

export default defineConfig({
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
  build: {
    outDir: '.vite/build/main',
    rollupOptions: {
      external: [
        'electron',
        ...nodeBuiltins,
        // -------------------------------------------------------------------
        // Native modules with .node binaries MUST be externalized.
        // Vite/Rollup cannot bundle native binaries.
        // Example: if you install 'better-sqlite3', add it here:
        // 'better-sqlite3',
        //
        // Pure JS packages should NOT be externalized -- let Vite bundle them
        // for tree-shaking and optimal load performance.
        // -------------------------------------------------------------------
      ],
    },
  },
});
