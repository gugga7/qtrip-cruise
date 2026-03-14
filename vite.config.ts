import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'QTRIP Shore',
        short_name: 'Shore',
        description: 'Plan unforgettable cruise port adventures — skip overpriced ship excursions',
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react-map-gl', 'mapbox-gl'],
  },
  define: {
    __VITE_OPENAI_API_KEY__: JSON.stringify(process.env.VITE_OPENAI_API_KEY),
    __VITE_MAPBOX_TOKEN__: JSON.stringify(process.env.VITE_MAPBOX_TOKEN),
    __VITE_OPENWEATHER_API_KEY__: JSON.stringify(process.env.VITE_OPENWEATHER_API_KEY),
    __VITE_AVIATION_API_KEY__: JSON.stringify(process.env.VITE_AVIATION_API_KEY),
  },
  server: {
    port: 5199,
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      'react-map-gl': 'react-map-gl/dist/esm',
    },
  }
});
