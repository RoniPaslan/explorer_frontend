import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // <-- tambahkan ini
    },
  },
  server: {
    port: 7000,       // ubah jadi port 7000 optional
    strictPort: true,
    open: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@fortawesome/fontawesome-free/css/all.min.css";`,
      },
    },
  },
});
