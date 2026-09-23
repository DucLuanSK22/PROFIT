import React, { useState, useEffect } from 'react';
import { UserRole, AccountKey, MultiAccountState, AuthState } from '../types/stock';
import { verifyLogin, registerNewAccount } from '../utils/authManager';
import { ShieldCheck, User, Users, Lock, ArrowRight, KeyRound, Sparkles, UserPlus, LogIn, Building, Hash, CheckCircle2, ShieldAlert } from 'lucide-react';

interface LoginModalProps {
  state: MultiAccountState;
  onLoginSuccess: (authState: AuthState) => void;
  onStateUpdate: (newState: MultiAccountState) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ state, onLoginSuccess, onStateUpdate }) => {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // PUBLIC USER PROFILES ONLY (Admin is HIDDEN from this list)
  const allAccountKeys = Object.keys(state.accounts || {});
  const [selectedRole, setSelectedRole] = useState<UserRole>(allAccountKeys[0] || 'ACCOUNT_1');
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // SECRET ADMIN LOGIN MODAL STATE
  const [showSecretAdminModal, setShowSecretAdminModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminErrorMsg, setAdminErrorMsg] = useState('');

  // REGISTER STATE
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regAccountName, setRegAccountName] = useState('');
  const [regBroker, setRegBroker] = useState('VPS');
  const [regAccountNum, setRegAccountNum] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regConfirmPin, setRegConfirmPin] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Listen for Secret Keyboard Shortcut: Ctrl + Shift + A or Alt + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) || (e.altKey && (e.key === 'A' || e.key === 'a'))) {
        e.preventDefault();
        setShowSecretAdminModal(true);
        setAdminErrorMsg('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Public User Profiles ONLY (Excludes Admin so normal users do NOT see Admin)
  const userProfiles = Object.values(state.accounts || {}).map((acc, idx) => ({
    role: acc.key,
    title: acc.name,
    subtitle: `${acc.broker} - ${acc.accountNumber}`,
    owner: acc.ownerName,
    icon: idx === 0 ? User : Users,
    color:
      idx === 0
        ? 'from-emerald-600 to-teal-600'
        : idx === 1
        ? 'from-purple-600 to-pink-600'
        : idx === 2
        ? 'from-amber-600 to-orange-600'
        : idx === 3
        ? 'from-blue-600 to-cyan-600'
        : 'from-rose-600 to-pink-600',
    defaultPin: acc.pin || '1234'
  }));

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg('');
    const target = userProfiles.find(p => p.role === role);
    if (target) {
      setPinInput(target.defaultPin);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = verifyLogin(selectedRole, pinInput, state);
    if (res.success && res.authState) {
      onLoginSuccess(res.authState);
    } else {
      setErrorMsg(res.error || 'Đăng nhập không thành công');
    }
  };

  const handleSecretAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminErrorMsg('');
    const res = verifyLogin('ADMIN', adminPinInput, state);
    if (res.success && res.authState) {
      setShowSecretAdminModal(false);
      onLoginSuccess(res.authState);
    } else {
      setAdminErrorMsg(res.error || 'Mã PIN Admin không đúng');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (regPin !== regConfirmPin) {
      setRegError('Mã PIN và Xác nhận PIN không trùng khớp');
      return;
    }

    const res = registerNewAccount(
      {
        ownerName: regOwnerName,
        accountName: regAccountName,
        broker: regBroker,
        accountNumber: regAccountNum,
        pin: regPin
      },
      state,
      onStateUpdate
    );

    if (res.success && res.authState) {
      setRegSuccess('Đăng ký tài khoản thành công! Đang tự động đăng nhập...');
      setTimeout(() => {
        onLoginSuccess(res.authState!);
      }, 1000);
    } else {
      setRegError(res.error || 'Đăng ký không thành công');
    }
  };

  const currentProfile = userProfiles.find(p => p.role === selectedRole) || userProfiles[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden glass-panel flex flex-col my-auto relative">
        
        {/* Top Header Mode Tabs */}
        <div className="bg-slate-950 p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white text-sm tracking-wide font-outfit">HỆ THỐNG ĐẦU TƯ CÁ NHÂN</span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('LOGIN')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'LOGIN'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng Nhập</span>
            </button>
            <button
              onClick={() => setActiveTab('REGISTER')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'REGISTER'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Đăng Ký Mới</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LOGIN MODE */}
        {activeTab === 'LOGIN' && (
          <div className="flex flex-col md:flex-row">
            {/* Left Side: User Profiles List (5 Accounts + Registered Accounts) */}
            <div className="w-full md:w-1/2 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-800 space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-white font-outfit">Chọn Tài Khoản Đăng Nhập</h2>
                <p className="text-xs text-slate-400 mt-1">Danh sách tài khoản thành viên trong nhóm ({userProfiles.length} tài khoản)</p>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {userProfiles.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedRole === p.role;

                  return (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => handleSelectRole(p.role)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? `bg-slate-800/90 border-blue-500/60 shadow-lg shadow-blue-500/10`
                          : `bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/40 text-slate-400`
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl bg-gradient-to-br ${p.color} text-white shadow-md`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{p.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{p.subtitle}</div>
                        </div>
                      </div>
                      {isSelected && <ArrowRight className="w-4 h-4 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side: PIN Verification Form */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-slate-950/60 space-y-6">
              <div className="space-y-5">
                <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${currentProfile.color} text-white`}>
                    <currentProfile.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Đang chọn tài khoản</span>
                    <h3 className="text-sm font-bold text-white">{currentProfile.title}</h3>
                    <span className="text-xs text-slate-400">{currentProfile.owner}</span>
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                        <span>Mã PIN Truy Cập</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">Gợi ý: {currentProfile.defaultPin}</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        maxLength={10}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        placeholder="Nhập mã PIN..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`w-full py-3 rounded-xl font-bold text-white text-xs bg-gradient-to-r ${currentProfile.color} hover:opacity-90 transition-all shadow-lg cursor-pointer flex items-center justify-center space-x-2`}
                  >
                    <span>Xác Nhận Đăng Nhập</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Footer Note + Subtle Secret Admin Trigger Button */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Dữ liệu bảo mật độc quyền từng tài khoản</span>

                {/* Subtle Hidden Lock Icon for Admin Login Trigger */}
                <button
                  type="button"
                  onClick={() => { setShowSecretAdminModal(true); setAdminErrorMsg(''); }}
                  className="p-1 rounded-lg text-slate-700 hover:text-slate-400 hover:bg-slate-800 transition-all cursor-pointer"
                  title="Quyền truy cập quản trị"
                >
                  <Lock className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER MODE */}
        {activeTab === 'REGISTER' && (
          <div className="p-6 md:p-8 bg-slate-950/60 space-y-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Đăng Ký Tài Khoản Mới</span>
              </div>
              <h2 className="text-xl font-extrabold text-white font-outfit">Tạo Tài Khoản Đầu Tư Cá Nhân</h2>
              <p className="text-xs text-slate-400 mt-0.5">Tạo tài khoản mới để tự theo dõi Lãi/Lỗ, Dòng tiền và Danh mục của bạn</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Owner Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Họ và Tên Chủ Tài Khoản *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={regOwnerName}
                    onChange={(e) => setRegOwnerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Account Display Name / Nickname */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tên Hiển Thị / Biệt Danh *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Tài Khoản Đầu Tư Cá Nhân"
                    value={regAccountName}
                    onChange={(e) => setRegAccountName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Broker Select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                    <Building className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Công Ty Chứng Khoán</span>
                  </label>
                  <select
                    value={regBroker}
                    onChange={(e) => setRegBroker(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="VPS">VPS (Công Ty CK VPS)</option>
                    <option value="DNSE">DNSE (Entrade X)</option>
                    <option value="TCBS">TCBS (Techcom Securities)</option>
                    <option value="SSI">SSI (Công Ty CK SSI)</option>
                    <option value="HSC">HSC (Công Ty CK TP.HCM)</option>
                    <option value="VNDIRECT">VNDIRECT</option>
                    <option value="MBS">MBS (MB Securities)</option>
                    <option value="VPBankS">VPBankS</option>
                  </select>
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                    <Hash className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Số Tài Khoản Chứng Khoán</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 0001234"
                    value={regAccountNum}
                    onChange={(e) => setRegAccountNum(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* PIN */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tạo Mã PIN / Mật Khẩu *</span>
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={10}
                    placeholder="Tạo mã PIN (VD: 1234)..."
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Confirm PIN */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Xác Nhận Mã PIN *</span>
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={10}
                    placeholder="Nhập lại mã PIN..."
                    value={regConfirmPin}
                    onChange={(e) => setRegConfirmPin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {regError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                  {regError}
                </div>
              )}

              {regSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('LOGIN')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Quay Lại Đăng Nhập
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Hoàn Tất Đăng Ký</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* SECRET ADMIN LOGIN MODAL OVERLAY (Only opens via secret lock button or Ctrl+Shift+A) */}
      {showSecretAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-blue-500/40 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Xác Nhận Quyền Admin</h3>
                  <p className="text-[11px] text-slate-400">Nhập mã PIN Quản Trị Viên để tiếp tục</p>
                </div>
              </div>
              <button
                onClick={() => setShowSecretAdminModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSecretAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                    <span>Mã PIN Quản Trị (Admin)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Mặc định: 8888</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    maxLength={10}
                    autoFocus
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    placeholder="Nhập mã PIN Admin..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {adminErrorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                  {adminErrorMsg}
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSecretAdminModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 cursor-pointer flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Đăng Nhập Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
