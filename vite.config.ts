import viteCompression from 'vite-plugin-compression';
// import mkcert from 'vite-plugin-mkcert' // включается вместе с mkcert() ниже
import vue from '@vitejs/plugin-vue';

import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'; // актуальный, на sharp
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';     // svgo для svg-спрайта
import { nodePolyfills } from 'vite-plugin-node-polyfills' // ⬅️ именованный импорт

// @ts-ignore
import path from 'path';


export default defineConfig({
  plugins: [
    vue(),
    // 1) КАРТИНКИ: сжимает jpg/png/svg + генерит webp/avif
    ViteImageOptimizer({
      png: { quality: 80, effort: 5 },
      jpeg: { quality: 78, mozjpeg: true },
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

    // mkcert(),
    nodePolyfills({ protocolImports: true }),
  ],

  server: {
    host: true,
    strictPort: true,
    port: 3000,
    // hmr: {
    //   protocol: 'wss',
    //   host: '192.168.0.170',
    //   clientPort: 3000,
    // },
    proxy: {
      '/api': {
        target: 'http://localhost:4090',
        changeOrigin: true,
        secure: false,
      },
      // Proxy S3 so GiftLottie fetch() works in local dev (S3 CORS is production-only)
      '/s3': {
        target: 'https://memgift.codes',
        changeOrigin: true,
        secure: true,
      },
    },
    // watch: { usePolling: true, interval: 300 },
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