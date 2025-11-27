# 🧰 全能办公工具箱 (Toolbox)

**全能办公工具箱** 是一款基于 **Electron + React** 构建的现代化桌面办公辅助软件。它集成了图片处理、PDF 高级操作、科学计算等多项高频办公功能，旨在通过极简的 UI 和极致的运行速度，提升用户的办公效率。

本项目完全本地化运行，无需联网上传文件，充分保障用户隐私安全。
<img width="1182" height="790" alt="image" src="https://github.com/user-attachments/assets/2a05fa31-eb65-4e8a-a837-58cca61642eb" />
<img width="1180" height="787" alt="image" src="https://github.com/user-attachments/assets/5e5138e4-c949-41bd-9175-9ce44c6f29cd" />

## ✨ 核心功能

### 1. 📄 PDF 工具箱 (专业级)

基于 `pdf-lib` 和 `pdfjs-dist` 深度开发，提供真实的文档处理能力：

- **PDF 合并**：支持多文件合并，并提供 **"统一为 A4 大小"** 选项，自动缩放居中，解决页面大小不一的问题。
- **PDF 拆分**：支持 **可视化页面选择** 或 **页码范围输入** (如 `1-5, 8`)，将选定页面拆分并打包为 ZIP 下载。
- **PDF 转图片**：内置 PDF 渲染引擎，支持预览每一页缩略图。用户可勾选特定页面，将其导出为 **高清 JPG/PNG** 图片包。
- **图片转 PDF**：将多张图片拼接合成为一个 PDF 文档。
- **PDF 压缩**：优化 PDF 内部结构，移除冗余对象，减小文件体积。（v1.0.0版本目前无效）

### 2. 🖼️ 图片格式转换

- 支持 **JPG, PNG, WEBP, BMP, ICO** 等格式互转。
- 支持转换质量/压缩率调节。（v1.0.0版本目前无效）
- 提供转换前后的全屏预览功能。

### 3. 🧮 科学计算器

- 支持基础四则运算。
- 支持高级数学函数：三角函数 (`sin`, `cos`, `tan`)、对数 (`log`, `ln`)、幂运算 (`x²`, `xʸ`)、开方 (`√`) 等。
- 支持键盘快捷键输入。

### 4. 📝 其他实用工具

- **文本处理**：字数/行数统计、一键去空、大小写转换。
- **单位换算**：长度、重量、数据存储容量的实时换算。

### 5. 🎨 个性化体验

- **深色模式 (Dark Mode)**：完美适配的深色/浅色主题切换，不仅改变背景，还适配所有组件细节。
- **响应式布局**：侧边栏导航，界面简洁直观。

## 🛠️ 技术栈

本项目采用当下最流行的前端技术栈构建：

- **Core**: [Electron](https://www.electronjs.org/) (v25+) - 跨平台桌面应用框架
- **UI Framework**: [React](https://react.dev/) (v18) - 用于构建用户界面
- **Build Tool**: [Vite](https://vitejs.dev/) - 极速的前端构建工具
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - 原子化 CSS 框架
- **Icons**: [Lucide React](https://lucide.dev/) - 美观一致的图标库
- **PDF Core**:
  - `pdf-lib`: PDF 文档生成与修改
  - `pdfjs-dist` (v3.11): PDF 读取与渲染 (Canvas)
  - `jspdf`: 图片生成 PDF
- **Utils**: `jszip` (文件打包), `file-saver`

## 🚀 快速开始 (开发指南)

如果你想在本地修改或运行源代码，请按以下步骤操作：

### 1. 环境准备

确保你的电脑已安装 **Node.js** (推荐 v16 或更高版本)。

### 2. 安装依赖

在项目根目录打开终端，运行：

```
npm install
```

### 3. 启动开发模式

这将同时启动 Vite 本地服务器和 Electron 窗口，支持热更新：

```
npm run electron:dev
```

## 📦 打包与部署

想要生成发给别人的 `.exe` 安装包？

### 1. 检查配置

确保 `package.json` 中的 `build` 字段已配置好（本项目已默认配置为 `portable` 或 `nsis` 安装包）。

### 2. 执行打包

```
npm run electron:build
```

*提示：如果下载 Electron 二进制文件遇到网络超时，命令中已内置国内镜像源配置。*

### 3. 获取产物

打包完成后，文件位于： `./release/全能工具箱 Setup 1.0.0.exe`

## 📂 项目结构

```
toolbox-electron/
├── electron/
│   ├── main.js
│   └── preload.js
├── src/
│   ├── components/
│   │   ├── SectionHeader.jsx
│   │   ├── Toast.jsx
│   │   ├── FilePreviewModal.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Calculator.jsx
│   │   ├── ImageConverter.jsx
│   │   ├── PDFTools.jsx
│   │   ├── TextTools.jsx
│   │   └── UnitConverter.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── index.html
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## ⚠️ 常见问题备忘

1. **PDF 解析失败？**
   - 本项目使用了 `pdfjs-dist` v3 版本，并采用静态资源引用的方式加载 Worker，确保了打包后的稳定性。请勿随意升级 `pdfjs-dist` 到 v4+，除非你解决了 Worker 的路径兼容问题。
2. **图标不显示？**
   - Windows 打包必须使用严格的 `.ico` 格式（推荐 256x256 尺寸）。请将图标放在 `public/icon.ico` 并确保 `package.json` 配置指向它。

## 📄 许可证


本项目采用 [MIT License](https://www.google.com/search?q=LICENSE) 开源许可证。
