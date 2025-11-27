import React from 'react';
import { createPortal } from 'react-dom'; // 引入 Portal
import { Eye, X, Files } from 'lucide-react';

const FilePreviewModal = ({ file, onClose }) => {
  if (!file) return null;

  // 使用 Portal 将弹窗渲染到 body 节点，彻底脱离父级布局限制
  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-5xl flex flex-col shadow-2xl transition-colors overflow-hidden" 
        style={{ height: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 z-10">
          <div className="flex items-center space-x-3 overflow-hidden">
             <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                <Eye size={20} />
             </div>
             <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate max-w-md">{file.name}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900/50 p-4 flex items-center justify-center">
          {file.type.startsWith('image/') ? (
            <img 
              src={file.preview} 
              alt="preview" 
              className="max-w-full max-h-full object-contain shadow-lg rounded-lg" 
            />
          ) : file.type === 'application/pdf' ? (
            <iframe 
              src={file.preview} 
              className="w-full h-full rounded-lg shadow-sm bg-white" 
              title="PDF Preview"
            ></iframe>
          ) : (
            <div className="text-slate-500 dark:text-slate-400 flex flex-col items-center">
              <Files size={64} className="mb-4 opacity-50" />
              <p className="text-lg">该文件类型暂不支持预览</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body // 挂载目标
  );
};

export default FilePreviewModal;