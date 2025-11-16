import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
  plugins: [vue(), tailwindcss(), vueDevTools()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            {
              name: 'openai',
              test: /node_modules[\\/]openai/
            },
            {
              name: 'markdown',
              test: /node_modules[\\/]vue-renderer-markdown/
            }
          ]
        }
      }
    }
  }
});
