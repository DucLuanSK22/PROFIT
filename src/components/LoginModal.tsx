import React, { useState } from 'react';
import { UserRole, AccountKey, MultiAccountState, AuthState } from '../types/stock';
import { verifyLogin } from '../utils/authManager';
import { ShieldCheck, User, Users, Lock, ArrowRight, KeyRound, Sparkles } from 'lucide-react';

interface LoginModalProps {
  state: MultiAccountState;
  onLoginSuccess: (authState: AuthState) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ state, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const profiles: { role: UserRole; title: string; subtitle: string; owner: string; icon: any; color: string; defaultPin: string }[] = [
    {
      role: 'ADMIN',
      title: 'Quản Trị Viên (Admin)',
      subtitle: 'Toàn quyền chuyển đổi 3 tài khoản & Xem báo cáo nhóm',
      owner: 'Admin System',
      icon: ShieldCheck,
      color: 'from-blue-600 to-indigo-600',
      defaultPin: '8888'
    },
    {
      role: 'ACCOUNT_1',
      title: state.accounts.ACCOUNT_1.name,
      subtitle: `${state.accounts.ACCOUNT_1.broker} - ${state.accounts.ACCOUNT_1.accountNumber}`,
      owner: state.accounts.ACCOUNT_1.ownerName,
      icon: User,
      color: 'from-emerald-600 to-teal-600',
      defaultPin: state.accounts.ACCOUNT_1.pin || '1234'
    },
    {
      role: 'ACCOUNT_2',
      title: state.accounts.ACCOUNT_2.name,
      subtitle: `${state.accounts.ACCOUNT_2.broker} - ${state.accounts.ACCOUNT_2.accountNumber}`,
      owner: state.accounts.ACCOUNT_2.ownerName,
      icon: Users,
      color: 'from-purple-600 to-pink-600',
      defaultPin: state.accounts.ACCOUNT_2.pin || '2222'
    },
    {
      role: 'ACCOUNT_3',
      title: state.accounts.ACCOUNT_3.name,
      subtitle: `${state.accounts.ACCOUNT_3.broker} - ${state.accounts.ACCOUNT_3.accountNumber}`,
      owner: state.accounts.ACCOUNT_3.ownerName,
      icon: Users,
      color: 'from-amber-600 to-orange-600',
      defaultPin: state.accounts.ACCOUNT_3.pin || '3333'
    }
  ];

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg('');
    const target = profiles.find(p => p.role === role);
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

  const currentProfile = profiles.find(p => p.role === selectedRole) || profiles[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden glass-panel flex flex-col md:flex-row">
        
        {/* Left Side: Role Selector */}
        <div className="w-full md:w-1/2 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-800 space-y-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phân Quyền Truy Cập Đa Tài Khoản</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white font-outfit">Đăng Nhập Hệ Thống</h2>
            <p className="text-xs text-slate-400 mt-1">Chọn vai trò tài khoản bạn muốn đăng nhập để tiếp tục</p>
          </div>

          <div className="space-y-3">
            {profiles.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedRole === p.role;

              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleSelectRole(p.role)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? `bg-slate-800/90 border-blue-500/60 shadow-lg shadow-blue-500/10`
                      : `bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/40 text-slate-400`
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${p.color} text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center space-x-2">
                        <span>{p.title}</span>
                        {p.role === 'ADMIN' && (
                          <span className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-300 rounded-md border border-blue-500/30">FULL</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{p.subtitle}</div>
                    </div>
                  </div>
                  {isSelected && <ArrowRight className="w-4 h-4 text-blue-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: PIN Verification Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-slate-950/60">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${currentProfile.color} text-white`}>
                <currentProfile.icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đang chọn đăng nhập</span>
                <h3 className="text-base font-bold text-white">{currentProfile.title}</h3>
                <span className="text-xs text-slate-400">{currentProfile.owner}</span>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
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
                className={`w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r ${currentProfile.color} hover:opacity-90 transition-all shadow-lg cursor-pointer flex items-center justify-center space-x-2`}
              >
                <span>Xác Nhận Đăng Nhập</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
            <p>💡 <b>Lưu ý phân quyền:</b></p>
            <p>• <b>Admin</b>: Quản lý cả 3 tài khoản & Xem biểu đồ so sánh nhóm.</p>
            <p>• <b>Tài khoản cá nhân</b>: Chỉ xem duy nhất dữ liệu của tài khoản đó.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
