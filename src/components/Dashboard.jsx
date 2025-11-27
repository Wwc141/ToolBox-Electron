import React from 'react';
import { FileImage, Files, Calculator, Type, Grid } from 'lucide-react';

const Dashboard = ({ setTool }) => {
  const tools = [
    { id: 'image', name: '图片转换', icon: FileImage, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', desc: '支持 PNG, JPG, WEBP, BMP' },
    { id: 'pdf', name: 'PDF 工具', icon: Files, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', desc: '合并、拆分、压缩、页面调整' },
    { id: 'calculator', name: '科学计算器', icon: Calculator, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', desc: '三角函数、对数、幂运算等' },
    { id: 'text', name: '文本处理', icon: Type, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', desc: '统计、格式化、清洗' },
    { id: 'unit', name: '单位换算', icon: Grid, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', desc: '长度、重量、存储' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">欢迎使用全能工具箱</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">高效办公，触手可及。</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map(tool => (
          <button key={tool.id} onClick={() => setTool(tool.id)} className="flex flex-col items-start p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:-translate-y-1 transition-all group">
            <div className={`p-3 rounded-lg ${tool.bg} ${tool.color} mb-4 group-hover:scale-110 transition-transform`}>
              <tool.icon size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">{tool.name}</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 text-left">{tool.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;