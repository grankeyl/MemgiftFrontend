import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import mkcert from 'vite-plugin-mkcert'
import vue from '@vitejs/plugin-vue';
import { nodePolyfills } from 'vite-plugin-node-polyfills' // ⬅️ именованный импорт

// @ts-ignore
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        { src: 'src/assets/animations/*.json', dest: 'lottie' },
        { src: 'src/assets/gifts/posts/*.jpg', dest: 'posts' },
        { src: 'src/assets/fonts/*.{woff,woff2}', dest: 'assets/styles/fonts' },
        { src: 'src/assets/fonts/*.ttf', dest: 'assets' },
        { src: 'src/assets/gifts/*.svg', dest: 'gifts' },
        { src: 'src/assets/gifts/png/*.png', dest: 'gifts/png' },
      ],
    }),
    mkcert(),
    nodePolyfills({ protocolImports: true }), // ← добавь это
  ],

  server: {
    // https: true,
    host: true,
    strictPort: true,
    port: 3000,
    hmr: {
      protocol: 'wss',      // при https нужен wss
      host: 'localhost',
      clientPort: 3000,
    },
    watch: { usePolling: true, interval: 300 },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@fonts': path.resolve(__dirname, 'src/assets/fonts'),
      buffer: 'buffer',
      process: 'process/browser',
    },
  },

  optimizeDeps: {
    include: ['buffer', 'process', '@ton/core', '@ton/crypto'],
    esbuildOptions: {
      define: { global: 'globalThis' },
    },
  },

  define: {
    'process.env': {}, // чтобы пакеты не падали в браузере
  },

  build: {
    target: 'es2019',
    sourcemap: false,
    minify: 'esbuild',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
  }
});