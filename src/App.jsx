import React, { useState, useEffect } from 'react';
import { FileImage, Files, Calculator, Type, Grid, Menu, X, Sun, Moon } from 'lucide-react';

import Dashboard from './components/Dashboard';
import ImageConverter from './components/ImageConverter';
import PDFTools from './components/PDFTools';
import CalculatorTool from './components/Calculator';
import TextTools from './components/TextTools';
import UnitConverter from './components/UnitConverter';
import Toast from './components/Toast';

export default function App() {
  const [activeTool, setActiveTool] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  
  // 主题状态管理
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // 监听主题变化，直接操作 html 标签
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const menuItems = [
    { id: 'dashboard', label: '仪表盘', icon: Grid },
    { id: 'image', label: '图片工具', icon: FileImage },
    { id: 'pdf', label: 'PDF 工具', icon: Files },
    { id: 'calculator', label: '科学计算器', icon: Calculator },
    { id: 'text', label: '文本工具', icon: Type },
    { id: 'unit', label: '单位换算', icon: Grid },
  ];

  const renderTool = () => {
    switch(activeTool) {
      case 'image': return <ImageConverter showToast={showToast} />;
      case 'pdf': return <PDFTools showToast={showToast} />;
      case 'calculator': return <CalculatorTool />;
      case 'text': return <TextTools showToast={showToast} />;
      case 'unit': return <UnitConverter />;
      default: return <Dashboard setTool={setActiveTool} />;
    }
  };

  return (
    // 核心修复：移除了 'flex-col'，默认为 row（水平排列），解决了侧边栏挤压内容的问题
    <div className="h-screen overflow-hidden flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-blue-500/50 shadow-lg">T</div>
              <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Toolbox</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-4 mt-2">工具列表</div>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTool(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${activeTool === item.id 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-700">
            <button 
              onClick={toggleTheme}
              className="flex items-center justify-center space-x-2 px-4 py-3 w-full rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{isDarkMode ? '切换亮色模式' : '切换深色模式'}</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="lg:hidden h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 justify-between shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 dark:text-slate-300">
            <Menu size={24} />
          </button>
          <span className="font-bold text-slate-800 dark:text-white">
            {menuItems.find(i => i.id === activeTool)?.label}
          </span>
          <div className="w-8" />
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
             {renderTool()}
          </div>
        </div>
      </main>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}