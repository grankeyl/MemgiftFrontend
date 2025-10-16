import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import mkcert from 'vite-plugin-mkcert';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'; // актуальный, на sharp
import viteCompression from 'vite-plugin-compression';            // gzip/brotli
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';     // svgo для svg-спрайта
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),
    // 1) КАРТИНКИ: сжимает jpg/png/svg + генерит webp/avif
    ViteImageOptimizer({
      png: { quality: 80, effort: 5 },
      jpeg: { quality: 78, mozjpeg: true },
      gif: { optimizationLevel: 3 },
      svg: { multipass: true },         // внутри — SVGO
      webp: { quality: 78 },
      avif: { quality: 50 },
      // автоматически создаст .webp/.avif для импортируемых файлов
    }),

    // 2) SVG-спрайт (опционально). Кладёшь иконки в src/assets/icons
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'i-[name]',
      svgoOptions: { multipass: true }
    }),

    // 3) PRECOMPRESS: создаёт .br и .gz — отдаются сервером мгновенно
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),

    mkcert(),
    nodePolyfills({ protocolImports: true }),
  ],

  server: {
    port: 3000,
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
    esbuildOptions: { define: { global: 'globalThis' } },
  },

  define: { 'process.env': {} },

  build: {
    target: 'es2019',
    sourcemap: false,
    minify: 'esbuild',
    assetsDir: 'assets',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
  },
});