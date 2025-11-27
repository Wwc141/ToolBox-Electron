import React, { useState } from 'react';
import { Files, Scissors, Minimize2, Image as ImageIcon, FileType, Maximize, Upload, Eye, FileText, Trash2, ArrowUp, ArrowDown, Download, CheckCircle, Loader, Check, ListChecks } from 'lucide-react';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import SectionHeader from './SectionHeader';
import FilePreviewModal from './FilePreviewModal';

// --- 适配 pdfjs-dist v3.11.174 ---
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
} catch (e) {
  console.error("Worker init failed", e);
}

const PDFTools = ({ showToast }) => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [processedFile, setProcessedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [mode, setMode] = useState('merge'); 
  
  const [pdfPages, setPdfPages] = useState([]); 
  const [isRenderingPages, setIsRenderingPages] = useState(false);
  
  const [imgFormat, setImgFormat] = useState('image/jpeg'); 
  const [pageRangeInput, setPageRangeInput] = useState('');

  const modeConfig = {
    merge: { title: 'PDF 合并', icon: Files, accept: '.pdf', action: '合并 PDF' },
    split: { title: 'PDF 拆分', icon: Scissors, accept: '.pdf', action: '拆分选定页面 (生成ZIP)' }, // 更新文案
    compress: { title: 'PDF 压缩', icon: Minimize2, accept: '.pdf', action: '优化压缩 PDF' },
    img2pdf: { title: '图片转 PDF', icon: ImageIcon, accept: 'image/*', action: '生成 PDF' },
    pdf2img: { title: 'PDF 转图片', icon: FileType, accept: '.pdf', action: '导出选中图片' }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setFiles([]);
    setPdfPages([]);
    setProcessedFile(null);
    setProgressText('');
    setPageRangeInput('');
    // 默认合并设置为原样
    if (newMode === 'merge') {
      setSettings(prev => ({ ...prev, pageSize: 'original' }));
    }
  };

  // 这里的 settings 状态在之前版本似乎被遗漏定义了，补上
  const [settings, setSettings] = useState({ pageSize: 'original', compressionLevel: 'medium' });

  const handleFiles = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const newFiles = selectedFiles.map(f => ({
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
      id: Math.random().toString(36).substr(2, 9),
      type: f.type,
      preview: URL.createObjectURL(f),
      raw: f
    }));

    // 拆分、转图片、压缩 依然是单文件模式
    if (mode === 'split' || mode === 'pdf2img' || mode === 'compress') {
        setFiles(newFiles.slice(0, 1)); 
        // 拆分模式 和 转图片模式 都需要加载页面预览
        if (mode === 'pdf2img' || mode === 'split') {
            await loadPdfPagesForSelection(newFiles[0].raw);
        }
    } else {
        setFiles(prev => [...prev, ...newFiles]);
    }
    setProcessedFile(null);
    e.target.value = null; 
  };

  const loadPdfPagesForSelection = async (file) => {
    setIsRenderingPages(true);
    setPdfPages([]);
    setPageRangeInput('');
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        const pages = [];

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.3 }); 
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            pages.push({
                pageNum: i,
                thumbnail: canvas.toDataURL('image/jpeg'),
                selected: true 
            });
        }
        setPdfPages(pages);
    } catch (error) {
        console.error("PDF Parse Error:", error);
        showToast('解析 PDF 页面失败，请确认文件未加密且完整', 'error');
    } finally {
        setIsRenderingPages(false);
    }
  };

  const togglePageSelection = (pageNum) => {
    setPdfPages(prev => prev.map(p => p.pageNum === pageNum ? { ...p, selected: !p.selected } : p));
  };

  const applyPageRange = () => {
    if (!pageRangeInput.trim()) {
        setPdfPages(prev => prev.map(p => ({ ...p, selected: true })));
        return;
    }

    const selectedPages = new Set();
    const parts = pageRangeInput.split(/[,;，；]/);

    parts.forEach(part => {
        const range = part.trim().split('-');
        if (range.length === 2) {
            const start = parseInt(range[0]);
            const end = parseInt(range[1]);
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
                    selectedPages.add(i);
                }
            }
        } else if (range.length === 1) {
            const page = parseInt(range[0]);
            if (!isNaN(page)) {
                selectedPages.add(page);
            }
        }
    });

    setPdfPages(prev => prev.map(p => ({
        ...p,
        selected: selectedPages.has(p.pageNum)
    })));
    
    showToast(`已选中 ${selectedPages.size} 个页面`, 'success');
  };

  const moveFile = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === files.length - 1)) return;
    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[index + direction];
    newFiles[index + direction] = temp;
    setFiles(newFiles);
  };

  const removeFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const processPDF = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgressText('准备处理...');

    try {
      let blob = null;
      let fileName = 'result.pdf';

      // === 1. 合并模式 (新增：页面大小统一) ===
      if (mode === 'merge') {
        const mergedPdf = await PDFDocument.create();
        
        for (let i = 0; i < files.length; i++) {
          setProgressText(`正在合并第 ${i + 1}/${files.length} 个文件...`);
          const arrayBuffer = await files[i].raw.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);
          
          if (settings.pageSize === 'a4') {
            // --- A4 统一模式 ---
            const embeddedPages = await mergedPdf.embedPages(pdf.getPages());
            const A4_WIDTH = 595.28;
            const A4_HEIGHT = 841.89;

            embeddedPages.forEach((embPage) => {
              // 计算缩放比例，保持比例适应 A4
              const scale = Math.min(
                A4_WIDTH / embPage.width,
                A4_HEIGHT / embPage.height
              );
              
              // 创建新的 A4 页面
              const page = mergedPdf.addPage([A4_WIDTH, A4_HEIGHT]);
              const scaledWidth = embPage.width * scale;
              const scaledHeight = embPage.height * scale;

              // 居中绘制
              page.drawPage(embPage, {
                x: (A4_WIDTH - scaledWidth) / 2,
                y: (A4_HEIGHT - scaledHeight) / 2,
                width: scaledWidth,
                height: scaledHeight,
              });
            });
          } else {
            // --- 原样合并模式 ---
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
          }
        }
        const pdfBytes = await mergedPdf.save();
        blob = new Blob([pdfBytes], { type: 'application/pdf' });
        fileName = 'merged.pdf';

      // === 2. 拆分模式 (新增：页面选择支持) ===
      } else if (mode === 'split') {
        const selectedPages = pdfPages.filter(p => p.selected);
        if (selectedPages.length === 0) throw new Error('请至少选择一页进行拆分');

        const zip = new JSZip();
        const sourceFile = files[0];
        const arrayBuffer = await sourceFile.raw.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        for (let i = 0; i < selectedPages.length; i++) {
          const pageInfo = selectedPages[i];
          setProgressText(`正在拆分第 ${pageInfo.pageNum} 页...`);
          
          const newPdf = await PDFDocument.create();
          // 复制特定页面 (pdf-lib索引从0开始，所以减1)
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageInfo.pageNum - 1]);
          newPdf.addPage(copiedPage);
          
          const pdfBytes = await newPdf.save();
          // 文件名使用原始页码
          zip.file(`${sourceFile.name.replace('.pdf', '')}_page_${pageInfo.pageNum}.pdf`, pdfBytes);
        }
        
        setProgressText('正在打包 ZIP...');
        blob = await zip.generateAsync({ type: 'blob' });
        fileName = 'split_files.zip';

      } else if (mode === 'compress') {
        setProgressText('正在优化结构...');
        const arrayBuffer = await files[0].raw.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pdfBytes = await pdfDoc.save({ useObjectStreams: false }); 
        blob = new Blob([pdfBytes], { type: 'application/pdf' });
        fileName = `compressed_${files[0].name}`;

      } else if (mode === 'img2pdf') {
        const doc = new jsPDF();
        let firstPage = true;
        for (let i = 0; i < files.length; i++) {
          setProgressText(`处理图片 ${i + 1}/${files.length}...`);
          if (!firstPage) doc.addPage();
          firstPage = false;
          const imgProps = doc.getImageProperties(files[i].preview);
          const pdfWidth = doc.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          doc.addImage(files[i].preview, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }
        blob = doc.output('blob');
        fileName = 'images.pdf';

      } else if (mode === 'pdf2img') {
        const selectedPages = pdfPages.filter(p => p.selected);
        if (selectedPages.length === 0) throw new Error('请至少选择一页');
        
        const zip = new JSZip();
        const arrayBuffer = await files[0].raw.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        
        const ext = imgFormat === 'image/png' ? 'png' : 'jpg';

        for (let i = 0; i < selectedPages.length; i++) {
            const pageNum = selectedPages[i].pageNum;
            setProgressText(`正在转换第 ${pageNum} 页...`);
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 }); 
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            
            const imgBlob = await new Promise(resolve => canvas.toBlob(resolve, imgFormat, 0.9));
            zip.file(`page_${pageNum}.${ext}`, imgBlob);
        }
        setProgressText('打包图片...');
        blob = await zip.generateAsync({ type: 'blob' });
        fileName = `pdf_images_${ext}.zip`;
      }

      const url = URL.createObjectURL(blob);
      setProcessedFile({ url, name: fileName });
      showToast(`${modeConfig[mode].title} 成功！`, 'success');

    } catch (error) {
      console.error(error);
      showToast(`失败: ${error.message}`, 'error');
    } finally {
      setProcessing(false);
      setProgressText('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-slate-200 dark:bg-slate-700 rounded-lg w-fit">
        {Object.entries(modeConfig).map(([key, config]) => (
          <button 
            key={key} 
            onClick={() => switchMode(key)} 
            className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 ${mode === key ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <config.icon size={14} className="hidden sm:block" />
            <span>{config.title}</span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div className="flex justify-between items-center mb-4">
          <SectionHeader icon={modeConfig[mode].icon} title={modeConfig[mode].title} colorClass="text-blue-500" />
          
          {/* 合并模式下的设置：页面统一 */}
          {mode === 'merge' && (
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
              <Maximize size={14} className="text-slate-500 dark:text-slate-400" />
              <select 
                value={settings.pageSize}
                onChange={(e) => setSettings({...settings, pageSize: e.target.value})}
                className="bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="original">保持原样</option>
                <option value="a4">统一为 A4 (缩放居中)</option>
              </select>
            </div>
          )}
        </div>

        {processedFile ? (
          <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex flex-col items-center justify-center text-center animate-fade-in">
            <CheckCircle size={48} className="text-green-500 mb-2" />
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">处理完成！</h4>
            <div className="flex space-x-4 mt-4">
              <a href={processedFile.url} download={processedFile.name} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center shadow-lg cursor-pointer">
                <Download size={18} className="mr-2" /> 下载文件
              </a>
              <button onClick={() => { setProcessedFile(null); if(mode!=='pdf2img' && mode!=='split') setFiles([]); }} className="px-6 py-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50">继续</button>
            </div>
          </div>
        ) : (
          <>
            {/* 上传区域 */}
            <div className={`border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl ${files.length > 0 ? 'p-4' : 'p-12'} flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors relative mb-6 cursor-pointer transition-all duration-300`}>
              <input type="file" multiple={mode === 'merge' || mode === 'img2pdf'} accept={modeConfig[mode].accept} className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFiles} />
              <Upload size={files.length > 0 ? 24 : 48} className={`mb-2 text-slate-300 dark:text-slate-500 transition-all ${files.length > 0 ? 'mb-1' : 'mb-4'}`} />
              <p className={`${files.length > 0 ? 'text-sm' : 'text-lg'} font-medium`}>
                {(mode === 'pdf2img' || mode === 'split') ? '更换 PDF 文件' : (files.length > 0 ? '继续添加文件' : '点击或拖拽文件到此处')}
              </p>
              {files.length === 0 && <p className="text-sm mt-2 opacity-70">支持 {modeConfig[mode].accept} 格式</p>}
            </div>

            {/* 页面选择器：适用于 转图片模式 和 拆分模式 */}
            {(mode === 'pdf2img' || mode === 'split') && files.length > 0 && (
                <div className="mb-6">
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg mb-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        {/* 仅在转图片模式显示格式选择 */}
                        {mode === 'pdf2img' && (
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">输出格式:</span>
                                <select 
                                    value={imgFormat} 
                                    onChange={(e) => setImgFormat(e.target.value)}
                                    className="bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="image/jpeg">JPG (小体积)</option>
                                    <option value="image/png">PNG (无损透明)</option>
                                </select>
                            </div>
                        )}

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">选择范围:</span>
                            <div className="flex flex-1 md:flex-none gap-2">
                                <input 
                                    type="text" 
                                    placeholder="例如: 1-5, 8, 12" 
                                    value={pageRangeInput}
                                    onChange={(e) => setPageRangeInput(e.target.value)}
                                    className="w-full md:w-40 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button 
                                    onClick={applyPageRange}
                                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/80 flex items-center gap-1"
                                >
                                    <ListChecks size={14} />
                                    应用
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-700 dark:text-slate-300">
                            {mode === 'split' ? '选择要保留/拆分的页面' : '选择要转换的页面'} 
                            ({pdfPages.filter(p => p.selected).length} / {pdfPages.length} 已选):
                        </h4>
                    </div>
                    
                    {isRenderingPages ? (
                        <div className="p-8 text-center text-slate-500"><Loader className="animate-spin inline mr-2"/> 正在解析页面预览...</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto custom-scrollbar p-1">
                            {pdfPages.map((page) => (
                                <div 
                                    key={page.pageNum} 
                                    onClick={() => togglePageSelection(page.pageNum)}
                                    className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${page.selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 dark:border-slate-600 opacity-60'}`}
                                >
                                    <img src={page.thumbnail} alt={`Page ${page.pageNum}`} className="w-full h-auto" />
                                    <div className="absolute top-2 right-2">
                                        {page.selected ? <div className="bg-blue-500 text-white p-1 rounded-full"><Check size={12}/></div> : <div className="bg-slate-300 p-1 rounded-full"><div className="w-3 h-3"/></div>}
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs text-center py-1">第 {page.pageNum} 页</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 常规文件列表 (合并模式/图片转PDF/压缩模式) */}
            {mode !== 'pdf2img' && mode !== 'split' && files.length > 0 && (
              <div className="space-y-2 mb-6 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {files.map((file, index) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-500 p-2 rounded shrink-0"><FileText size={18} /></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                        <p className="text-xs text-slate-400">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        {/* 只有合并和图片转PDF支持排序 */}
                        {(mode === 'merge' || mode === 'img2pdf') && (
                            <>
                            <button onClick={() => moveFile(index, -1)} disabled={index === 0} className="p-1 text-slate-400 hover:text-blue-500 disabled:opacity-20"><ArrowUp size={14} /></button>
                            <button onClick={() => moveFile(index, 1)} disabled={index === files.length - 1} className="p-1 text-slate-400 hover:text-blue-500 disabled:opacity-20"><ArrowDown size={14} /></button>
                            </>
                        )}
                        <button onClick={() => setPreviewFile(file)} className="p-1.5 text-slate-400 hover:text-blue-500"><Eye size={16} /></button>
                        <button onClick={() => removeFile(file.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {files.length > 0 && (
                <button onClick={processPDF} disabled={processing || ((mode === 'pdf2img' || mode === 'split') && isRenderingPages)} className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center space-x-2 transition-all ${processing ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30'}`}>
                {processing ? (
                    <div className="flex items-center"><Loader className="animate-spin mr-2" size={18} /> {progressText || '处理中...'}</div>
                ) : <span>
                    {(mode === 'pdf2img' || mode === 'split') ? `导出选中的 ${pdfPages.filter(p=>p.selected).length} 页` : modeConfig[mode].action}
                  </span>}
                </button>
            )}
          </>
        )}
      </div>
      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
};

export default PDFTools;