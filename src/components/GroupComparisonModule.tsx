import React from 'react';
import { MultiAccountState, AccountKey } from '../types/stock';
import { formatVND, formatPercent } from './SummaryCards';
import { ShieldCheck, Trophy, TrendingUp, Users, DollarSign, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface GroupComparisonModuleProps {
  state: MultiAccountState;
}

export const GroupComparisonModule: React.FC<GroupComparisonModuleProps> = ({ state }) => {
  const accKeys: AccountKey[] = ['ACCOUNT_1', 'ACCOUNT_2', 'ACCOUNT_3'];
  
  const accSummaries = accKeys.map(key => {
    const acc = state.accounts[key];
    const trades = acc.trades || [];
    const cashTxns = acc.cashTxns || [];
    const holdings = acc.holdings || [];

    const totalRealizedProfit = trades.reduce((s, t) => s + t.profit, 0);
    const totalCostValue = trades.reduce((s, t) => s + t.costValue, 0);
    const roiPercent = totalCostValue > 0 ? (totalRealizedProfit / totalCostValue) * 100 : 0;

    const winningTrades = trades.filter(t => t.profit > 0).length;
    const winRatePercent = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;

    const totalDeposited = cashTxns.filter(t => t.type === 'DEPOSIT').reduce((s, t) => s + t.amount, 0);
    const totalWithdrawn = cashTxns.filter(t => t.type === 'WITHDRAWAL').reduce((s, t) => s + t.amount, 0);
    const netInvestedCapital = totalDeposited - totalWithdrawn;

    const totalMarketValueHoldings = holdings.reduce((s, h) => s + h.currentMarketValue, 0);

    return {
      key,
      name: acc.name,
      ownerName: acc.ownerName,
      broker: acc.broker,
      accountNumber: acc.accountNumber,
      tradeCount: trades.length,
      realizedProfit: totalRealizedProfit,
      roiPercent,
      winRatePercent,
      netInvestedCapital,
      holdingsValue: totalMarketValueHoldings
    };
  });

  // Sort by Realized Profit descending to find winner
  const ranked = [...accSummaries].sort((a, b) => b.realizedProfit - a.realizedProfit);
  const topWinner = ranked[0];

  // Total Group Capital
  const groupTotalCapital = accSummaries.reduce((s, a) => s + a.netInvestedCapital, 0);
  const groupTotalProfit = accSummaries.reduce((s, a) => s + a.realizedProfit, 0);
  const groupTotalHoldings = accSummaries.reduce((s, a) => s + a.holdingsValue, 0);

  // Chart data comparing profit & capital
  const barChartData = accSummaries.map(a => ({
    name: a.ownerName,
    'Vốn Nạp Ròng': a.netInvestedCapital,
    'Lãi Lỗ Đã Thực Hiện': a.realizedProfit,
    'Giá Trị Danh Mục': a.holdingsValue
  }));

  return (
    <div className="space-y-6 w-full">
      {/* Admin Title Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border border-blue-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Báo Cáo Quản Trị Viên (Admin View Only)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white font-outfit">Báo Cáo So Sánh & Báo Cáo Tổng Hợp Nhóm</h2>
          <p className="text-xs text-slate-300">
            Tổng hợp dữ liệu dòng tiền, hiệu suất đầu tư và xếp hạng giữa 3 tài khoản (Tôi, Bạn A, Bạn B)
          </p>
        </div>

        {topWinner && (
          <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 self-start md:self-auto">
            <Trophy className="w-7 h-7 text-amber-400" />
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold">Xếp Hạng #1 LN Lớn Nhất</div>
              <div className="text-sm font-bold text-white">{topWinner.ownerName} ({formatVND(topWinner.realizedProfit)})</div>
            </div>
          </div>
        )}
      </div>

      {/* Group KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tổng Vốn Nạp Ròng Cả Nhóm</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono">{formatVND(groupTotalCapital)}</div>
          <div className="text-[11px] text-slate-400">Vốn thực tế gộp từ 3 tài khoản</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tổng Lãi/Lỗ Thực Hiện Cả Nhóm</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono">{formatVND(groupTotalProfit)}</div>
          <div className="text-[11px] text-slate-400">Lợi nhuận đã chốt lời ròng</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tổng Giá Trị Danh Mục Nhóm</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-extrabold text-purple-400 font-mono">{formatVND(groupTotalHoldings)}</div>
          <div className="text-[11px] text-slate-400">Giá trị thị trường mở</div>
        </div>
      </div>

      {/* Group Comparison Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Biểu Đồ So Sánh Chỉ Số Giữa 3 Tài Khoản</span>
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `${(val / 1e6).toFixed(0)}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any) => [formatVND(Number(val)), '']}
              />
              <Legend />
              <Bar dataKey="Vốn Nạp Ròng" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Lãi Lỗ Đã Thực Hiện" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Giá Trị Danh Mục" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Accounts Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accSummaries.map((acc, idx) => {
          const isWinner = topWinner && topWinner.key === acc.key;
          const isProfitable = acc.realizedProfit >= 0;

          return (
            <div
              key={acc.key}
              className={`glass-panel p-6 rounded-2xl border transition-all space-y-4 relative overflow-hidden ${
                isWinner
                  ? 'border-amber-500/50 bg-slate-900/90 shadow-xl shadow-amber-500/5'
                  : 'border-slate-800 bg-slate-900/80'
              }`}
            >
              {isWinner && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-md flex items-center space-x-1">
                  <Trophy className="w-3 h-3" />
                  <span>TOP 1 ROI</span>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br ${
                  acc.key === 'ACCOUNT_1' ? 'from-emerald-600 to-teal-600' : acc.key === 'ACCOUNT_2' ? 'from-purple-600 to-pink-600' : 'from-amber-600 to-orange-600'
                }`}>
                  #{idx + 1}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{acc.name}</h4>
                  <p className="text-xs text-slate-400">{acc.ownerName} • {acc.accountNumber}</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Lãi / Lỗ Đã Thực Hiện:</span>
                  <span className={`font-mono font-bold ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatVND(acc.realizedProfit)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tỷ Suất ROI (%):</span>
                  <span className={`font-mono font-bold ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPercent(acc.roiPercent)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tỷ Lệ Thắng (Win Rate):</span>
                  <span className="font-mono font-bold text-blue-400">
                    {formatPercent(acc.winRatePercent)} ({acc.tradeCount} lệnh)
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Vốn Nạp Ròng:</span>
                  <span className="font-mono font-bold text-slate-200">{formatVND(acc.netInvestedCapital)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Giá Trị Danh Mục Nắm Giữ:</span>
                  <span className="font-mono font-bold text-purple-400">{formatVND(acc.holdingsValue)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
