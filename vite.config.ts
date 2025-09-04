import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
})
