import React from 'react';
import { UploadedFileInfo } from '../types/stock';
import { formatVND } from './SummaryCards';
import { FileSpreadsheet, User, Calendar, Trash2 } from 'lucide-react';

interface UploadedFilesListProps {
  files: UploadedFileInfo[];
  onRemoveFile: (fileName: string) => void;
}

export const UploadedFilesList: React.FC<UploadedFilesListProps> = ({ files, onRemoveFile }) => {
  if (files.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/60 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
          <FileSpreadsheet className="w-4 h-4 text-blue-400" />
          <span>Danh Sách File Đã Nạp ({files.length} file)</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {files.map((file) => (
          <div
            key={file.fileName}
            className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between space-x-3 hover:border-slate-700 transition-colors text-xs"
          >
            <div className="space-y-1 overflow-hidden">
              <div className="font-semibold text-slate-200 truncate flex items-center space-x-1.5" title={file.fileName}>
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                <span className="truncate">{file.fileName}</span>
              </div>

              <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                <span className="flex items-center space-x-1">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>{file.account} ({file.nameOwner})</span>
                </span>
              </div>

              <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{file.fromDate || 'N/A'} - {file.toDate || 'N/A'}</span>
                </span>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{file.tradeCount} lệnh</span>
                <span className={`font-bold ${file.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatVND(file.totalProfit)}
                </span>
              </div>
            </div>

            <button
              onClick={() => onRemoveFile(file.fileName)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Xóa file này khỏi danh sách gộp"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
