import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// Fondasi T-01.1: Vue 3 + Tailwind (v4, CSS-first) + Pinia + Router.
export default defineConfig({
  plugins: [vue(), tailwindcss()],
})
