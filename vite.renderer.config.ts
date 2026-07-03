import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['pixi.js', 'pixi.js/unsafe-eval'],
  },
});
