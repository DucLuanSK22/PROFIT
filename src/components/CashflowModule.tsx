import React, { useState } from 'react';
import { CashTransaction, AccountData } from '../types/stock';
import { formatVND } from './SummaryCards';
import { ArrowDownLeft, ArrowUpRight, Wallet, DollarSign, PlusCircle, Calendar, FileText, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface CashflowModuleProps {
  accountData: AccountData;
  onAddTransaction: (txn: CashTransaction) => void;
}

export const CashflowModule: React.FC<CashflowModuleProps> = ({ accountData, onAddTransaction }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [txnType, setTxnType] = useState<'DEPOSIT' | 'WITHDRAWAL' | 'FEE' | 'MARGIN_INTEREST'>('DEPOSIT');
  const [amountInput, setAmountInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().slice(0, 10));
  const [noteInput, setNoteInput] = useState('');

  const cashTxns = accountData.cashTxns || [];

  const totalDeposited = cashTxns.filter(t => t.type === 'DEPOSIT').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = cashTxns.filter(t => t.type === 'WITHDRAWAL').reduce((s, t) => s + t.amount, 0);
  const totalFeesAndMargin = cashTxns.filter(t => t.type === 'FEE' || t.type === 'MARGIN_INTEREST').reduce((s, t) => s + t.amount, 0);
  const netInvestedCapital = totalDeposited - totalWithdrawn;

  // Realized profit from trades
  const totalRealizedProfit = (accountData.trades || []).reduce((s, t) => s + t.profit, 0);
  // Available cash estimate = Net invested capital + Realized Profit - Fees/Margin
  const availableCash = netInvestedCapital + totalRealizedProfit - totalFeesAndMargin;

  // Prepare chart data
  const sortedTxns = [...cashTxns].sort((a, b) => a.timestamp - b.timestamp);
  let cumNetCapital = 0;
  const chartData = sortedTxns.map(t => {
    if (t.type === 'DEPOSIT') cumNetCapital += t.amount;
    if (t.type === 'WITHDRAWAL') cumNetCapital -= t.amount;
    return {
      date: t.date,
      amount: t.type === 'DEPOSIT' ? t.amount : -t.amount,
      netCapital: cumNetCapital
    };
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amountInput.replace(/,/g, ''));
    if (isNaN(num) || num <= 0) return;

    const dParts = dateInput.split('-');
    const formattedDate = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}/${dParts[0]}` : dateInput;

    const newTxn: CashTransaction = {
      id: `cash_${Date.now()}`,
      date: formattedDate,
      timestamp: new Date(dateInput).getTime(),
      type: txnType,
      amount: num,
      note: noteInput || (txnType === 'DEPOSIT' ? 'Nạp tiền vào tài khoản' : 'Rút tiền về ngân hàng')
    };

    onAddTransaction(newTxn);
    setShowAddModal(false);
    setAmountInput('');
    setNoteInput('');
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-outfit flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span>Giao Dịch Tiền & Vốn Đầu Tư ({accountData.name})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Quản lý lịch sử nạp/rút tiền, tính vốn nạp ròng và số dư khả dụng</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/20 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ghi Nhận Nạp / Rút Tiền</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Net Invested Capital */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Vốn Nạp Ròng (Net Capital)</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-white font-mono">{formatVND(netInvestedCapital)}</div>
          <div className="text-[11px] text-slate-400">Tổng Nạp ({formatVND(totalDeposited)}) - Rút ({formatVND(totalWithdrawn)})</div>
        </div>

        {/* 2. Total Deposited */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tổng Tiền Đã Nạp</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono">{formatVND(totalDeposited)}</div>
          <div className="text-[11px] text-slate-400">{cashTxns.filter(t => t.type === 'DEPOSIT').length} lần nạp vốn</div>
        </div>

        {/* 3. Total Withdrawn */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tổng Tiền Đã Rút</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-purple-400 font-mono">{formatVND(totalWithdrawn)}</div>
          <div className="text-[11px] text-slate-400">{cashTxns.filter(t => t.type === 'WITHDRAWAL').length} lần rút tiền</div>
        </div>

        {/* 4. Estimated Available Cash */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Số Dư Tiền Ước Tính</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-amber-400 font-mono">{formatVND(availableCash)}</div>
          <div className="text-[11px] text-slate-400">Vốn ròng + Lãi đã thực hiện</div>
        </div>
      </div>

      {/* Chart: Net Invested Capital Trend */}
      {chartData.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>Biểu Đồ Biến Động Nguồn Vốn Đầu Tư (Net Invested Capital Over Time)</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNetCap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `${(val / 1e6).toFixed(0)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [formatVND(Number(val)), 'Vốn ròng tích lũy']}
                />
                <Area type="monotone" dataKey="netCapital" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorNetCap)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Cash Transactions Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Lịch Sử Giao Dịch Tiền ({cashTxns.length} giao dịch)</span>
          </h3>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/90 text-slate-300 uppercase tracking-wider text-[11px] font-bold border-b border-slate-800 select-none">
              <tr>
                <th className="py-3.5 px-4">STT</th>
                <th className="py-3.5 px-4">Ngày Giao Dịch</th>
                <th className="py-3.5 px-4">Loại Giao Dịch</th>
                <th className="py-3.5 px-4 text-right">Số Tiền (VNĐ)</th>
                <th className="py-3.5 px-4">Ghi Chú / Diễn Giải</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {cashTxns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Chưa có lịch sử giao dịch tiền nào. Bấm "Ghi Nhận Nạp / Rút Tiền" để thêm.
                  </td>
                </tr>
              ) : (
                cashTxns.map((t, idx) => {
                  const isDeposit = t.type === 'DEPOSIT';
                  const isWithdrawal = t.type === 'WITHDRAWAL';

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-mono">{t.date}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] border ${
                          isDeposit
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : isWithdrawal
                            ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                            : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        }`}>
                          {isDeposit ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          <span>{isDeposit ? 'Nạp Tiền' : isWithdrawal ? 'Rút Tiền' : 'Phí / Lãi Vay'}</span>
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-mono font-bold text-sm ${
                        isDeposit ? 'text-emerald-400' : isWithdrawal ? 'text-purple-400' : 'text-amber-400'
                      }`}>
                        {isDeposit ? '+' : '-'}{formatVND(t.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{t.note}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              <span>Thêm Giao Dịch Tiền</span>
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Loại Giao Dịch</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxnType('DEPOSIT')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      txnType === 'DEPOSIT'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Nạp Tiền (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxnType('WITHDRAWAL')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      txnType === 'WITHDRAWAL'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Rút Tiền (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Số Tiền (VNĐ)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 50,000,000"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ngày Giao Dịch</span>
                </label>
                <input
                  type="date"
                  required
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ghi Chú / Lý Do</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nạp thêm vốn mua cổ phiếu"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Lưu Giao Dịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
