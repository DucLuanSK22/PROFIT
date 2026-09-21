import React from 'react';
import { SummaryStats } from '../types/stock';
import { TrendingUp, TrendingDown, DollarSign, Award, PieChart, Shield, Receipt, Scale } from 'lucide-react';

interface SummaryCardsProps {
  stats: SummaryStats;
}

export function formatVND(val: number): string {
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const formatted = new Intl.NumberFormat('vi-VN').format(absVal);
  return `${isNegative ? '-' : ''}${formatted} ₫`;
}

export function formatPercent(val: number): string {
  const isPositive = val > 0;
  const formatted = val.toFixed(2).replace('.', ',');
  return `${isPositive ? '+' : ''}${formatted}%`;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const isNetProfitPositive = stats.netProfit >= 0;
  const isStockProfitPositive = stats.stocksStats.netProfit >= 0;
  const isWarrantProfitPositive = stats.warrantsStats.netProfit >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* CARD 1: OVERALL NET PROFIT */}
      <div className={`glass-panel rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 ${
        isNetProfitPositive
          ? 'border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/30 shadow-lg shadow-emerald-500/5'
          : 'border-red-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-red-950/30 shadow-lg shadow-red-500/5'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Lãi / Lỗ Ròng Tổng Hợp</span>
          <div className={`p-2 rounded-xl border ${
            isNetProfitPositive
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {isNetProfitPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        </div>

        <div className="mt-3">
          <div className={`text-2xl font-extrabold tracking-tight font-outfit ${
            isNetProfitPositive ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {formatVND(stats.netProfit)}
          </div>
          <div className="flex items-center space-x-2 mt-1 text-xs">
            <span className={`font-semibold px-2 py-0.5 rounded-full ${
              isNetProfitPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
            }`}>
              ROI: {formatPercent(stats.overallRoiPercent)}
            </span>
            <span className="text-slate-400">trên tổng vốn bán</span>
          </div>
        </div>
      </div>

      {/* CARD 2: WIN RATE & PROFIT FACTOR */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/70">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Tỷ Lệ Thắng (Win Rate)</span>
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-100 font-outfit">
              {stats.winRatePercent.toFixed(1).replace('.', ',')}%
            </span>
            <span className="text-xs text-slate-400">
              ({stats.winningTrades} thắng / {stats.losingTrades} thua)
            </span>
          </div>

          {/* Win Rate Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
              style={{ width: `${stats.winRatePercent}%` }}
            ></div>
            <div
              className="bg-red-500 h-full rounded-r-full transition-all duration-500"
              style={{ width: `${100 - stats.winRatePercent}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Hệ số Lãi/Lỗ (PF): <strong className="text-slate-200">{stats.profitFactor.toFixed(2)}</strong></span>
            <span>Tổng {stats.totalTrades} lệnh</span>
          </div>
        </div>
      </div>

      {/* CARD 3: TOTAL VALUE & FEES */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/70">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Tổng Giá Trị Bán & Phí</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Receipt className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Giá trị bán:</span>
            <span className="font-semibold text-slate-200">{formatVND(stats.totalSellValue)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Giá trị vốn:</span>
            <span className="font-semibold text-slate-300">{formatVND(stats.totalCostValue)}</span>
          </div>
          <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
            <span className="text-amber-400">Phí + Thuế:</span>
            <span className="font-semibold text-amber-300">{formatVND(stats.totalFeeAndTax)}</span>
          </div>
        </div>
      </div>

      {/* CARD 4: STOCKS BREAKDOWN */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/70 hover:border-emerald-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Chứng Khoán</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 font-medium">
            {stats.stocksStats.tradeCount} lệnh
          </span>
        </div>

        <div className="mt-3">
          <div className={`text-xl font-bold font-outfit ${isStockProfitPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatVND(stats.stocksStats.netProfit)}
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
            <span>Win Rate: <strong className="text-slate-200">{stats.stocksStats.winRatePercent.toFixed(1)}%</strong></span>
            <span>ROI: <strong className="text-slate-200">{formatPercent(stats.stocksStats.roiPercent)}</strong></span>
          </div>
        </div>
      </div>

      {/* CARD 5: WARRANTS BREAKDOWN */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/70 hover:border-purple-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Chứng Quyền</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-medium">
            {stats.warrantsStats.tradeCount} lệnh
          </span>
        </div>

        <div className="mt-3">
          <div className={`text-xl font-bold font-outfit ${isWarrantProfitPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatVND(stats.warrantsStats.netProfit)}
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
            <span>Win Rate: <strong className="text-slate-200">{stats.warrantsStats.winRatePercent.toFixed(1)}%</strong></span>
            <span>ROI: <strong className="text-slate-200">{formatPercent(stats.warrantsStats.roiPercent)}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
