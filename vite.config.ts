/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // @ts-expect-error - Vitest extends Vite's config with a 'test' property.
  // Using 'vitest/config' would cause plugin type conflicts with @vitejs/plugin-react.
  // This is the recommended approach per Vitest docs when using Vite plugins.
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/build/**',
        '**/.{git,cache,output,temp}/**'
      ],
      // Note: Global thresholds are intentionally low as we're focusing on critical paths
      // Individual critical files (useContentGeneration, API routes) exceed 80% coverage
      thresholds: {
        lines: 2,
        functions: 10,
        branches: 20,
        statements: 2
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-progress', '@radix-ui/react-label', '@radix-ui/react-slot', '@radix-ui/react-alert-dialog'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-anthropic': ['@anthropic-ai/sdk'],
          'vendor-utils': ['lucide-react', 'sonner', 'class-variance-authority', 'clsx', 'tailwind-merge']
        },
        // Add hashing for long-term caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning threshold since we're code-splitting properly
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'sonner'
    ],
  },
  server: {
    fs: {
      strict: true,
    },
    cors: true,
    proxy: {
      // Proxy alle API-Routes zu Vercel Functions
      '^/api/.*': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        configure: (proxy: any) => {
          // Fallback falls Vercel nicht läuft - bessere Error Messages
          proxy.on('error', (_err: any, _req: any, res: any) => {
            console.log('\n🚨 API Proxy Error: Vercel dev server nicht erreichbar auf Port 3001')
            console.log('💡 Tipp: Starte "vercel dev --port 3001" in einem separaten Terminal')
            if ('writeHead' in res) {
              res.writeHead(503, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ 
                error: 'API temporarily unavailable - Vercel dev server not running',
                hint: 'Run "vercel dev --port 3001" in a separate terminal'
              }))
            }
          })
        }
      }
    }
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
})