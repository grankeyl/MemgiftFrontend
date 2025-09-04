// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import replace from '@rollup/plugin-replace'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'

export default defineConfig(({ command }) => {
  const noHmr = process.env.NO_HMR === '1'

  return {
    esbuild: { target: 'es2019' },

    plugins: [
      vue(),

      // Жёстко выпиливаем HMR хуки из прод-бандла
      command === 'build' && replace({
        values: {
          'import.meta.hot': 'undefined',
          // подсобим TS-трансформам, если где-то есть проверки
          'import_meta.hot': 'undefined',
        },
        preventAssignment: true,
      }),

      // legacy — только на build
      command === 'build' && legacy({
        targets: ['defaults', 'iOS >= 12', 'Android >= 7'],
        modernPolyfills: true,
        renderLegacyChunks: true,
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      }),

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
    ].filter(Boolean),

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@fonts': path.resolve(__dirname, 'src/assets/fonts'),
      },
    },

    server: { 
      port: 3000,
      host: true,
      hmr: noHmr ? false : undefined,
    },

    build: {
      target: 'es2019',
      sourcemap: false,
      minify: 'esbuild',
      assetsDir: 'assets',
      modulePreload: { polyfill: true },
      rollupOptions: {
        output: { manualChunks: { vue: ['vue'] } },
      },
    },
  }
})