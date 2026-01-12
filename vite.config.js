import { defineConfig } from 'vite';

export default defineConfig({
  base: '/scale-climber/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    target: 'es2020',
    // Manual chunks will be configured later when all modules are implemented
    rollupOptions: {},
  },
  worker: {
    format: 'es',
    plugins: [],
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
