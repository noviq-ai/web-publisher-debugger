import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'
import fs from 'fs'

// Custom plugin to copy and update manifest.json
function chromeExtensionPlugin() {
  return {
    name: 'chrome-extension',
    writeBundle() {
      const manifestPath = path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'manifest.json')
      const packagePath = path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'package.json')
      const distManifestPath = path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'dist/manifest.json')

      // Read package.json version
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))

      // Read and update manifest.json
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
      manifest.version = packageJson.version

      // Write to dist
      fs.writeFileSync(distManifestPath, JSON.stringify(manifest, null, 2))
      console.log(`✓ Manifest updated with version ${packageJson.version}`)
    }
  }
}

export default defineConfig({
  plugins: [tailwindcss(), react(), chromeExtensionPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'src')
    }
  },
  build: {
    rollupOptions: {
      input: {
        sidepanel: path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'index.html'),
        options: path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'options.html'),
        help: path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'help.html'),
        background: path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/background/service-worker.ts'),
        content: path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/content/index.ts'),
        injected: path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/content/injected.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        inlineDynamicImports: false,
        // Content scripts need to be self-contained (no imports)
        manualChunks: undefined,
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  publicDir: 'public',
  server: {
    port: 5173,
    strictPort: true,
  }
})
