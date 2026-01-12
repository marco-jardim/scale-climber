import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/scale-climber/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'icon.svg', 'robots.txt'],
      manifest: {
        name: 'Scale Climber - Vocal Pitch Training',
        short_name: 'Scale Climber',
        description: 'Train your vocal pitch by climbing the musical mountain! A fun, interactive game that helps you learn to sing in tune.',
        theme_color: '#667eea',
        background_color: '#764ba2',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/scale-climber/',
        start_url: '/scale-climber/',
        icons: [
          {
            src: '/scale-climber/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/scale-climber/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,opus}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'game-logic': [
            './src/game/GameEngine.js',
            './src/game/ScaleChallenge.js',
            './src/game/PracticeMode.js',
            './src/game/ScoreSystem.js',
          ],
          audio: [
            './src/audio/AudioContextManager.js',
            './src/audio/PitchDetector.js',
            './src/audio/CalibrationEngine.js',
          ],
          visuals: [
            './src/visuals/CanvasRenderer.js',
            './src/visuals/CharacterSprite.js',
            './src/visuals/PitchMeter.js',
            './src/visuals/ParticleSystem.js',
          ],
        },
      },
    },
  },
  worker: {
    format: 'es',
    plugins: () => [],
  },
  server: {
    port: 30000,
    https: false, // Set to true for local HTTPS testing (mic requires secure context)
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.js',
        '**/*.spec.js',
      ],
    },
  },
});
