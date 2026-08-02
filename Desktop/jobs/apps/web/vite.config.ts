import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Resolve @nexahire/types to its TypeScript source, not the CommonJS dist. The
// dist is built CJS (the api needs CommonJS), and Vite's dev pre-bundler can't
// see named exports re-exported through `export *` from a CJS module, which
// crashes the app with "does not provide an export named 'apiErrorBodySchema'".
// Compiling the workspace source directly is the standard monorepo fix and keeps
// dev and build consistent.
const nexahireTypesSrc = fileURLToPath(
  new URL('../../packages/types/src/index.ts', import.meta.url),
)

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@nexahire/types': nexahireTypesSrc,
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'NexaHire Copilot',
        short_name: 'NexaHire',
        description: 'AI Job-Application Copilot',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
})
