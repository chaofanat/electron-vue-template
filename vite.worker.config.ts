import { defineConfig } from 'vite';
import { resolve } from 'path';

// Worker thread build configuration.
// Workers run in separate Node.js threads and have their own Vite entry point.
// See vite.main.config.ts for externalization rules.
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
        // Same externalization rules as vite.main.config.ts apply here.
        // Add any native modules you externalize in the main config.
      ],
    },
  },
});
