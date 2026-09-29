import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';
import { vendorAssets } from './scripts/vendor-assets';

export default defineConfig({
  // Rutas relativas: la app funciona tanto en la raíz de un dominio como en
  // una subcarpeta (por ejemplo, GitHub Pages).
  base: './',
  plugins: [
    vendorAssets(),
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'Renglón — lector',
        short_name: 'Renglón',
        description: 'Leé documentos Word y PDF página a página o de a un renglón. Todo queda en tu dispositivo.',
        lang: 'es',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f7f3ea',
        theme_color: '#f7f3ea',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,mjs,css,html,woff2,svg,png,webmanifest}'],
        globIgnores: ['vendor/**', '**/*cyrillic*', '**/*greek*', '**/*vietnamese*'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // Recursos pesados (OCR, tablas de pdf.js): se guardan al usarse por primera vez.
            urlPattern: ({ url }) => url.pathname.includes('/vendor/'),
            handler: 'CacheFirst',
            options: { cacheName: 'renglon-vendor', expiration: { maxEntries: 400 } },
          },
        ],
      },
    }),
  ],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 2500,
  },
  server: { host: true },
  preview: { host: true },
});
