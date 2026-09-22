import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Sparkles, AlertCircle, CheckCircle2, ShieldAlert, Trash2 } from 'lucide-react';
import { UploadedFileInfo } from '../types/stock';

interface DropzoneProps {
  onFilesDropped: (files: File[]) => void;
  onLoadSampleData?: () => void;
  onRemoveAllFiles?: () => void;
  uploadedFiles: UploadedFileInfo[];
  duplicateCount: number;
  isLoading: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFilesDropped,
  onLoadSampleData,
  onRemoveAllFiles,
  uploadedFiles,
  duplicateCount,
  isLoading
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesDropped(filesArray);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesDropped(filesArray);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 p-8 text-center ${
          isDragOver
            ? 'border-blue-500 bg-blue-500/10 shadow-2xl shadow-blue-500/20 scale-[1.01]'
            : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xls,.xlsx,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center shadow-inner group">
            <UploadCloud className={`w-8 h-8 text-blue-400 transition-transform duration-300 ${isDragOver ? 'scale-110 -translate-y-1' : ''}`} />
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Kéo thả các file Excel <span className="text-blue-400 font-bold">Lãi Lỗ Đã Thực Hiện (.xls / .xlsx)</span> vào đây
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Hỗ trợ thả cùng lúc <span className="text-amber-300 font-medium">nhiều file</span> từ trang VPS (HTML XLS hoặc Excel). Hệ thống sẽ tự động phân loại <span className="text-emerald-400 font-medium">Chứng Khoán</span> & <span className="text-purple-400 font-medium">Chứng Quyền</span> và tự gộp trùng lặp.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              Chọn file từ máy tính
            </button>

            {onLoadSampleData && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLoadSampleData();
                }}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-300 font-medium text-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nạp dữ liệu mẫu thực tế (6 file VPS)</span>
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-slate-200">Đang đọc & tự động gộp dữ liệu...</span>
          </div>
        )}
      </div>

      {/* Upload Status & Deduplication Banner */}
      {uploadedFiles.length > 0 && (
        <div className="glass-panel rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-200">
                Đã nạp thành công {uploadedFiles.length} file
              </span>
              <span className="text-slate-400 ml-2">
                ({uploadedFiles.map(f => f.fileName).join(', ')})
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {duplicateCount > 0 && (
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Đã loại bỏ {duplicateCount} lệnh trùng</span>
              </div>
            )}

            {onRemoveAllFiles && (
              <button
                type="button"
                onClick={onRemoveAllFiles}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold transition-all cursor-pointer"
                title="Xóa toàn bộ các file đã nạp"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Tất Cả File</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
