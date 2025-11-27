/** @type {import('tailwindcss').Config} */
export default {
  // 关键：开启手动类名控制暗色模式
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}