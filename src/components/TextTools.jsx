import React, { useState, useEffect } from 'react';
import { Type } from 'lucide-react';
import SectionHeader from './SectionHeader';

const TextTools = ({ showToast }) => {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({ chars: 0, words: 0, lines: 0 });

  useEffect(() => {
    setStats({ chars: text.length, words: text.trim() ? text.trim().split(/\s+/).length : 0, lines: text.trim() ? text.split(/\n/).length : 0 });
  }, [text]);

  const handleCopy = () => { navigator.clipboard.writeText(text); showToast('已复制', 'success'); };
  
  return (
    <div className="bg-white dark:bg-slate-800 h-full p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col animate-fade-in transition-colors">
       <SectionHeader icon={Type} title="文本清洗与统计" colorClass="text-indigo-500" />
      <div className="flex-1 relative mb-4">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="在此处粘贴文本..." className="w-full h-64 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl resize-none outline-none font-mono text-sm transition-colors" />
        <div className="absolute bottom-4 right-4 text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded backdrop-blur-sm border border-slate-200 dark:border-slate-600">
          {stats.chars} 字符 | {stats.words} 词 | {stats.lines} 行
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button onClick={() => setText(text.replace(/\s+/g, ' '))} className="p-2 text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg">去除空格</button>
        <button onClick={() => setText(text.toUpperCase())} className="p-2 text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg">转大写</button>
        <button onClick={() => setText(text.toLowerCase())} className="p-2 text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg">转小写</button>
        <button onClick={handleCopy} className="p-2 text-sm bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-medium">复制结果</button>
      </div>
    </div>
  );
};

export default TextTools;