import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command }) => {
  const isServe = command === 'serve';
  
  return {
    plugins: [react()],
    // 开发环境用绝对路径，生产环境用相对路径
    base: isServe ? '/' : './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
    },
    build: {
      // 这是一个兼容性更好的输出设置
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
    }
  }
})