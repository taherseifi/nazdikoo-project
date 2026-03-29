import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import prerender from '@prerenderer/rollup-plugin'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      plugins: [
        prerender({
          routes: [
            '/listings',
            '/nearby-services',
            '/faq',
            '/contact-us',
            '/privacy-policy',
            '/submit-business',
            '/guide-submit-business',
          ],
        }),
      ],
    },
  },
})