import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'banner.png'],
      manifest: {
        name: 'Test de Fatiga Agrosuper',
        short_name: 'Fatiga Agrosuper',
        description: 'Evaluación de Vigilancia Psicomotora para trabajadores de Agrosuper',
        theme_color: '#1B2B3A',
        background_color: '#1B2B3A',
        display: 'standalone',
        scope: '/test-fatiga-agrosuper/',
        start_url: '/test-fatiga-agrosuper/',
        orientation: 'portrait',
        lang: 'es',
        categories: ['health', 'productivity'],
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg}', 'icons/*.png'],
        globIgnores: ['banner.png'],
        navigateFallback: '/test-fatiga-agrosuper/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
  base: '/test-fatiga-agrosuper/',
})
