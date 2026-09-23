import React, { useRef } from 'react';
import { AuthState, UserRole, AccountKey, ActiveModule, MultiAccountState } from '../types/stock';
import { exportBackupJson, importBackupJson, resetToSampleData } from '../utils/storageManager';
import { 
  TrendingUp, Wallet, Briefcase, BarChart2, ShieldCheck, User, Users, 
  LogOut, Download, Upload, RotateCcw, Sparkles 
} from 'lucide-react';

interface HeaderProps {
  authState: AuthState;
  state: MultiAccountState;
  activeModule: ActiveModule;
  onSelectAccount: (key: AccountKey) => void;
  onSelectModule: (module: ActiveModule) => void;
  onLogout: () => void;
  onStateChange: (newState: MultiAccountState) => void;
}

export const Header: React.FC<HeaderProps> = ({
  authState,
  state,
  activeModule,
  onSelectAccount,
  onSelectModule,
  onLogout,
  onStateChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = authState.role === 'ADMIN';
  const activeAccKey = authState.activeAccountKey;
  const currentAcc = state.accounts[activeAccKey] || state.accounts.ACCOUNT_1;

  const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importBackupJson(file);
      onStateChange(imported);
      alert('Đã khôi phục dữ liệu 3 tài khoản từ file sao lưu JSON thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi đọc file JSON');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetSample = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục lại dữ liệu mẫu 3 tài khoản ban đầu?')) {
      const fresh = resetToSampleData();
      onStateChange(fresh);
    }
  };

  return (
    <header className="w-full glass-panel bg-slate-900/90 border-b border-slate-800 shadow-xl sticky top-0 z-40">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand & Active Account Badge */}
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black tracking-tight text-white font-outfit">
                INVESTMENT DASHBOARD
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 rounded-md border border-blue-500/30">
                PRO 2026
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Quản lý Lãi/Lỗ, Dòng tiền & Danh mục cho {isAdmin ? '3 Tài Khoản Group' : currentAcc.name}
            </p>
          </div>
        </div>

        {/* User Role Badge & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Active User Badge */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            {isAdmin ? <ShieldCheck className="w-4 h-4 text-blue-400" /> : <User className="w-4 h-4 text-emerald-400" />}
            <span className="font-bold text-white">{authState.userName}</span>
          </div>

          {/* Backup JSON Button */}
          <button
            onClick={() => exportBackupJson(state)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-all cursor-pointer"
            title="Xuất sao lưu 3 tài khoản ra file .json"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Sao Lưu JSON</span>
          </button>

          {/* Import JSON Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-all cursor-pointer"
            title="Nạp dữ liệu từ file sao lưu .json"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Nạp JSON</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleJsonUpload}
            accept=".json"
            className="hidden"
          />

          {/* Reset Sample Data Button */}
          <button
            onClick={handleResetSample}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 transition-all cursor-pointer"
            title="Khôi phục lại dữ liệu mẫu 3 tài khoản"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nạp Mẫu</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold border border-red-500/30 transition-all cursor-pointer"
            title="Đăng xuất khỏi vai trò hiện tại"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </div>

      {/* Sub Header: Account Switcher (For ADMIN) & Module Tabs Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 border-t border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        
        {/* Account Switcher: Visible to ADMIN ONLY */}
        {isAdmin ? (
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <span className="px-2 text-[11px] font-bold text-slate-400 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Xem TK:</span>
            </span>

            <select
              value={activeModule === 'GROUP_SUMMARY' ? 'GROUP_SUMMARY' : activeAccKey}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'GROUP_SUMMARY') {
                  onSelectModule('GROUP_SUMMARY');
                } else {
                  onSelectAccount(val);
                  if (activeModule === 'GROUP_SUMMARY') {
                    onSelectModule('REALIZED_PNL');
                  }
                }
              }}
              className="bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="GROUP_SUMMARY">📊 Báo Cáo Tổng Hợp Tất Cả ({Object.keys(state.accounts || {}).length} TK)</option>
              <optgroup label="Danh sách Tài Khoản Thành Viên">
                {Object.values(state.accounts || {}).map((acc) => (
                  <option key={acc.key} value={acc.key}>
                    👤 {acc.name} ({acc.ownerName} - {acc.broker})
                  </option>
                ))}
              </optgroup>
            </select>

            <button
              onClick={() => onSelectModule('GROUP_SUMMARY')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeModule === 'GROUP_SUMMARY'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-900 text-blue-400 hover:text-blue-300 border border-slate-800'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tổng Hợp Group</span>
            </button>
          </div>
        ) : (
          /* Scoped Individual User Account Badge */
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            <User className="w-4 h-4 text-emerald-400" />
            <span className="font-extrabold text-white text-xs">{currentAcc.name} ({currentAcc.accountNumber})</span>
            <span className="text-[10px] text-slate-400 px-2 py-0.5 bg-slate-800 rounded-md">Độc Quyền</span>
          </div>
        )}

        {/* 3 Module Tabs Selector for Active Account */}
        {activeModule !== 'GROUP_SUMMARY' && (
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onSelectModule('REALIZED_PNL')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeModule === 'REALIZED_PNL'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>1. Lãi/Lỗ Đã Thực Hiện</span>
            </button>

            <button
              onClick={() => onSelectModule('CASHFLOW')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeModule === 'CASHFLOW'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>2. Giao Dịch Tiền</span>
            </button>

            <button
              onClick={() => onSelectModule('HOLDINGS')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeModule === 'HOLDINGS'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>3. Danh Mục Nắm Giữ</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
