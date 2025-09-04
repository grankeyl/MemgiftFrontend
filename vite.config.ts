import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import vue from '@vitejs/plugin-vue';
import vueDevtools from 'vite-plugin-vue-devtools'
// @ts-ignore
import path from 'path';

export default defineConfig({
  // esbuild: {
  //   target: 'esnext',
  // },

  plugins: [
    vue(),
    vueDevtools(),
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
  ],

  server: {
    port: 3000,
    // proxy: {
    //   '^/api': {
    //     target: 'https://test1.g4m1.biz',
    //     changeOrigin: true,
    //     ws: true,
    //     secure: false,
    //     configure: (proxy) => {
    //       proxy.on('proxyReq', (proxyReq) => {
    //         proxyReq.setHeader('X-Pinggy-No-Screen', '1');
    //       });
    //     }
    //   },
    // }
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@fonts': path.resolve(__dirname, 'src/assets/fonts'),
    },
  },

  // build: {
  //   target: 'esnext',
  //   sourcemap: false,
  //   minify: 'esbuild',
  //   assetsDir: 'assets',
  //   rollupOptions: {
  //     output: {
  //       manualChunks: {
  //         vue: ['vue'],
  //       },
  //     },
  //   },
  // },
});