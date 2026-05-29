import { defineConfig } from 'vite'
import uniFn from '@dcloudio/vite-plugin-uni'

const uni = (uniFn as any).default || uniFn

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})