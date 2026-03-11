import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const isLibrary = mode === 'library'

  return {
    plugins: [vue()],
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      exclude: ['punycode']
    },
    build: isLibrary ? {
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        name: 'VueLlmUi',
        fileName: 'vue-llm-ui'
      },
      rollupOptions: {
        external: ['vue', 'shiki', 'shiki-stream', 'shiki-stream/vue', /^shiki\//],
        output: {
          globals: {
            vue: 'Vue',
            shiki: 'Shiki',
            'shiki-stream/vue': 'ShikiStreamVue'
          }
        }
      },
      cssCodeSplit: false,
      emptyOutDir: true
    } : undefined
  }
})
