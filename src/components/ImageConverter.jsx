import React, { useState } from 'react';
import { FileImage, Upload, Eye, Zap, Download } from 'lucide-react';
import SectionHeader from './SectionHeader';
import FilePreviewModal from './FilePreviewModal';

const ImageConverter = ({ showToast }) => {
  const [file, setFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [format, setFormat] = useState('image/png');
  const [quality, setQuality] = useState(0.9);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type.startsWith('image/')) {
      const url = URL.createObjectURL(selected);
      setFile({ name: selected.name, type: selected.type, preview: url, raw: selected });
      setResult(null);
    } else {
      showToast('请上传有效的图片文件', 'error');
    }
  };

  const convertImage = () => {
    if (!file) return;
    setProcessing(true);
    const img = new Image();
    img.src = file.preview;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const dataUrl = canvas.toDataURL(format, quality);
        setResult(dataUrl);
        setProcessing(false);
        showToast('图片转换成功！', 'success');
      } catch (e) {
        setProcessing(false);
        showToast('浏览器不支持此格式导出', 'error');
      }
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <SectionHeader icon={FileImage} title="图片格式转换" colorClass="text-blue-500" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors relative cursor-pointer group h-64">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" onChange={handleFileChange} />
              {file ? (
                <div className="relative w-full h-full group-hover:opacity-90 transition-opacity">
                  <img src={file.preview} alt="Preview" className="h-full w-full object-contain rounded" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded">
                     <div className="bg-white/90 text-slate-800 px-3 py-1 rounded-full text-sm font-medium shadow-lg">点击更换</div>
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={48} className="mb-2 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  <p>点击或拖拽图片到此处</p>
                  <p className="text-xs text-slate-400 mt-1">支持 JPG, PNG, WEBP, BMP</p>
                </>
              )}
            </div>
            {file && (
              <button 
                onClick={() => setPreviewFile(file)}
                className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <Eye size={16} className="mr-2" /> 全屏预览
              </button>
            )}
          </div>
          <div className="space-y-6">
             <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">目标格式</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg outline-none">
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WEBP</option>
                <option value="image/bmp">BMP</option>
                <option value="image/x-icon">ICO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">质量: {Math.round(quality * 100)}%</label>
              <input type="range" min="0.1" max="1" step="0.1" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>
            <button onClick={convertImage} disabled={!file || processing} className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center space-x-2 transition-all ${!file ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30'}`}>
              {processing ? <span>处理中...</span> : <><Zap size={18} /><span>开始转换</span></>}
            </button>
            {result && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between animate-fade-in">
                <span className="text-green-700 dark:text-green-400 font-medium text-sm">转换完成</span>
                <a href={result} download={`converted.${format.split('/')[1] === 'x-icon' ? 'ico' : format.split('/')[1]}`} className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-sm flex items-center shadow-sm"><Download size={16} className="mr-1" /> 下载</a>
              </div>
            )}
          </div>
        </div>
      </div>
      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
};

export default ImageConverter;