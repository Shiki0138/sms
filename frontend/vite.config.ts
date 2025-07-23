import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env
  },
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/store': path.resolve(__dirname, './src/store'),
    },
  },
  server: {
    port: 4003,
    host: true,
    hmr: {
      overlay: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:4002',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    target: 'es2020', // esnextからes2020に変更（Vercel互換性向上）
    sourcemap: false, // 本番では無効化
    modulePreload: {
      polyfill: false, // Vercelでのエラーを防ぐ
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // ベンダーライブラリを分離
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', 'react-chartjs-2'], 
          ui: ['@headlessui/react', 'lucide-react'], // lucide-reactを含める
          utils: ['date-fns', 'clsx']
        }
      }
    },
    chunkSizeWarningLimit: 500, // 警告サイズを500KBに設定
    minify: 'terser', // Terserで最適化
    terserOptions: {
      compress: {
        drop_console: true, // console.log を削除
        drop_debugger: true, // debugger を削除
      },
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
    // lucide-reactを除外せず、最適化に含める
  },
  esbuild: {
    // Tree-shakingを最適化
    treeShaking: true,
    // TypeScriptエラーを無視（Vercel対応）
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
})