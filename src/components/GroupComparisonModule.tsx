import React from 'react';
import { MultiAccountState, AccountKey } from '../types/stock';
import { formatVND, formatPercent } from './SummaryCards';
import { ShieldCheck, Trophy, TrendingUp, Users, DollarSign, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface GroupComparisonModuleProps {
  state: MultiAccountState;
}

export const GroupComparisonModule: React.FC<GroupComparisonModuleProps> = ({ state }) => {
  const accKeys: AccountKey[] = Object.keys(state.accounts || {});
  
  const accSummaries = accKeys.map(key => {
    const acc = state.accounts[key];
    const trades = acc.trades || [];
    const cashTxns = acc.cashTxns || [];
    const holdings = acc.holdings || [];

    const stockTrades = trades.filter(t => t.assetType === 'STOCK');
    const warrantTrades = trades.filter(t => t.assetType === 'WARRANT');

    const stockRealizedProfit = stockTrades.reduce((s, t) => s + t.profit, 0);
    const warrantRealizedProfit = warrantTrades.reduce((s, t) => s + t.profit, 0);

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
      stockTradeCount: stockTrades.length,
      warrantTradeCount: warrantTrades.length,
      stockRealizedProfit,
      warrantRealizedProfit,
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
  const groupStockProfit = accSummaries.reduce((s, a) => s + a.stockRealizedProfit, 0);
  const groupWarrantProfit = accSummaries.reduce((s, a) => s + a.warrantRealizedProfit, 0);
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
          <h2 className="text-2xl font-extrabold text-white font-outfit">Báo Cáo So Sánh & Tổng Hợp Chi Tiết Nhóm</h2>
          <p className="text-xs text-slate-300">
            Tổng hợp dữ liệu dòng tiền, hiệu suất Cổ phiếu vs Chứng quyền và xếp hạng giữa các tài khoản
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
          <div className="text-[11px] text-slate-400">Vốn thực tế gộp các tài khoản</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tổng Lãi/Lỗ Thực Hiện Cả Nhóm</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-xl font-extrabold font-mono ${groupTotalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatVND(groupTotalProfit)}
          </div>
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

      {/* NEW: Table Phân Loại Lãi/Lỗ Cổ Phiếu vs Chứng Quyền theo Tài Khoản */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white flex items-center space-x-2 font-outfit">
            <Award className="w-5 h-5 text-emerald-400" />
            <span>BẢNG TỔNG HỢP LÃI / LỖ PHÂN LOẠI CỔ PHIẾU VS CHỨNG QUYỀN</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">{accSummaries.length} Tài Khoản</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-300 border-b border-slate-800">
                <th className="py-3 px-4 font-bold">STT</th>
                <th className="py-3 px-4 font-bold">TÀI KHOẢN / HỌ TÊN</th>
                <th className="py-3 px-4 font-bold text-center">CTY CK</th>
                <th className="py-3 px-4 font-bold text-right text-emerald-400">LÃI / LỖ CỔ PHIẾU (STOCK)</th>
                <th className="py-3 px-4 font-bold text-right text-purple-400">LÃI / LỖ CHỨNG QUYỀN (WARRANT)</th>
                <th className="py-3 px-4 font-bold text-right text-blue-400">TỔNG LÃI / LỖ THỰC HIỆN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {accSummaries.map((acc, idx) => {
                const isStockProfitable = acc.stockRealizedProfit >= 0;
                const isWarrantProfitable = acc.warrantRealizedProfit >= 0;
                const isTotalProfitable = acc.realizedProfit >= 0;

                return (
                  <tr key={acc.key} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{acc.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{acc.ownerName} • {acc.accountNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700">
                        {acc.broker}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <div className={isStockProfitable ? 'text-emerald-400' : 'text-red-400'}>
                        {formatVND(acc.stockRealizedProfit)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">({acc.stockTradeCount} lệnh)</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <div className={isWarrantProfitable ? 'text-purple-400' : 'text-red-400'}>
                        {formatVND(acc.warrantRealizedProfit)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">({acc.warrantTradeCount} lệnh)</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-sm">
                      <span className={isTotalProfitable ? 'text-emerald-400' : 'text-red-400'}>
                        {formatVND(acc.realizedProfit)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-950 text-white font-bold border-t-2 border-slate-700 text-xs">
                <td colSpan={3} className="py-3.5 px-4 text-slate-300 font-extrabold uppercase tracking-wider">
                  TỔNG CỘNG TOÀN BỘ NHÓM
                </td>
                <td className={`py-3.5 px-4 text-right font-mono text-sm font-black ${groupStockProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatVND(groupStockProfit)}
                </td>
                <td className={`py-3.5 px-4 text-right font-mono text-sm font-black ${groupWarrantProfit >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                  {formatVND(groupWarrantProfit)}
                </td>
                <td className={`py-3.5 px-4 text-right font-mono text-base font-black ${groupTotalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatVND(groupTotalProfit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Group Comparison Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Biểu Đồ So Sánh Chỉ Số Giữa Các Tài Khoản</span>
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
                  acc.key === 'ACCOUNT_1' ? 'from-emerald-600 to-teal-600' : 'from-blue-600 to-indigo-600'
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
                  <span className="text-slate-400">Lãi/Lỗ Cổ Phiếu:</span>
                  <span className={`font-mono font-bold ${acc.stockRealizedProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatVND(acc.stockRealizedProfit)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Lãi/Lỗ Chứng Quyền:</span>
                  <span className={`font-mono font-bold ${acc.warrantRealizedProfit >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                    {formatVND(acc.warrantRealizedProfit)}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-800/60 pt-1.5">
                  <span className="text-slate-300 font-semibold">Tổng Lãi / Lỗ Thực Hiện:</span>
                  <span className={`font-mono font-bold text-sm ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
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
