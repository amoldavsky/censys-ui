import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  server: { port: 5173 },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
