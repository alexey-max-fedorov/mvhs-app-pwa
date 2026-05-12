import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const babel = require('@babel/core');

// Custom plugin: transform all src .js files through Babel to handle
// Flow type annotations and JSX in .js files (legacy codebase convention).
function babelFlowPlugin() {
  return {
    name: 'babel-flow-strip',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('/src/') || id.includes('node_modules') || !id.endsWith('.js')) {
        return null;
      }
      const result = babel.transformSync(code, {
        filename: id,
        presets: [
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
        plugins: ['@babel/plugin-transform-flow-strip-types'],
        sourceMaps: true,
        configFile: false,
        babelrc: false,
      });
      return { code: result.code, map: result.map };
    },
  };
}

export default defineConfig({
  plugins: [
    babelFlowPlugin(),
    react(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'MVHS App',
        short_name: 'MVHS',
        theme_color: '#050506',
        background_color: '#050506',
        display: 'standalone',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  resolve: {
    // material-ui@1.0.0-beta uses @babel/runtime/core-js/* paths (v7 style)
    // which don't exist. Redirect to babel-runtime/core-js (v6) which is installed.
    alias: {
      '@babel/runtime/core-js': 'babel-runtime/core-js',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      // Packages removed in Task 4 are still imported by legacy source files
      // that will be rewritten in Tasks 7-16. Mark them external so Rollup
      // does not crash the build during the transition.
      external: [
        /^material-ui(\/.*)?$/,
        /^material-ui-icons(\/.*)?$/,
        /^react-loadable$/,
        /^react-inline-css$/,
        /^react-dates(\/.*)?$/,
        /^offline-plugin(\/.*)?$/,
        /^enzyme$/,
        // react-router-dom v4 used deep /es/* sub-paths that don't exist in v6;
        // fixed in Task 7 (App.jsx rewrite) but legacy components may still reference them.
        /^react-router-dom\/es\/.+$/,
        // Dead relative imports in legacy components not yet rewritten (Tasks 8-16).
        // CovidLinksContainer was deleted; still referenced in SchedulePage.js via react-loadable.
        /CovidLinksContainer/,
      ],
    },
  },
});
