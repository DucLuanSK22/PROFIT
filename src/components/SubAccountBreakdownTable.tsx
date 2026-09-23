import React from 'react';
import { TradeRecord } from '../types/stock';
import { formatVND } from './SummaryCards';
import { Layers, Building } from 'lucide-react';

interface SubAccountBreakdownTableProps {
  trades: TradeRecord[];
  title?: string;
}

export const SubAccountBreakdownTable: React.FC<SubAccountBreakdownTableProps> = ({
  trades,
  title = "BẢNG TỔNG HỢP LÃI / LỖ PHÂN LOẠI CỔ PHIẾU VS CHỨNG QUYỀN THEO TIỂU KHOẢN"
}) => {
  // Group trades by sub-account (trade.account)
  const subAccountsMap = new Map<string, {
    accountLabel: string;
    stockProfit: number;
    stockCount: number;
    warrantProfit: number;
    warrantCount: number;
    totalProfit: number;
    totalCount: number;
  }>();

  trades.forEach(t => {
    const accLabel = t.account || 'Tài khoản mặc định';
    const existing = subAccountsMap.get(accLabel) || {
      accountLabel: accLabel,
      stockProfit: 0,
      stockCount: 0,
      warrantProfit: 0,
      warrantCount: 0,
      totalProfit: 0,
      totalCount: 0
    };

    if (t.assetType === 'WARRANT') {
      existing.warrantProfit += t.profit;
      existing.warrantCount += 1;
    } else {
      existing.stockProfit += t.profit;
      existing.stockCount += 1;
    }
    existing.totalProfit += t.profit;
    existing.totalCount += 1;

    subAccountsMap.set(accLabel, existing);
  });

  const subAccountRows = Array.from(subAccountsMap.values()).sort((a, b) => b.totalProfit - a.totalProfit);

  const totalStockProfit = subAccountRows.reduce((s, r) => s + r.stockProfit, 0);
  const totalWarrantProfit = subAccountRows.reduce((s, r) => s + r.warrantProfit, 0);
  const grandTotalProfit = subAccountRows.reduce((s, r) => s + r.totalProfit, 0);

  if (subAccountRows.length === 0) return null;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-base font-extrabold text-white flex items-center space-x-2 font-outfit">
          <Layers className="w-5 h-5 text-emerald-400" />
          <span>{title}</span>
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          Phát hiện {subAccountRows.length} Tiểu Khoản trong tài khoản hiện tại
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/80 text-slate-300 border-b border-slate-800">
              <th className="py-3 px-4 font-bold">STT</th>
              <th className="py-3 px-4 font-bold">SỐ TIỂU KHOẢN / CTY CK</th>
              <th className="py-3 px-4 font-bold text-right text-emerald-400">LÃI / LỖ CỔ PHIẾU (STOCK)</th>
              <th className="py-3 px-4 font-bold text-right text-purple-400">LÃI / LỖ CHỨNG QUYỀN (WARRANT)</th>
              <th className="py-3 px-4 font-bold text-right text-blue-400">TỔNG LÃI / LỖ THỰC HIỆN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {subAccountRows.map((row, idx) => {
              const isStockProfitable = row.stockProfit >= 0;
              const isWarrantProfitable = row.warrantProfit >= 0;
              const isTotalProfitable = row.totalProfit >= 0;

              return (
                <tr key={row.accountLabel} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm font-mono flex items-center space-x-1.5">
                      <Building className="w-3.5 h-3.5 text-blue-400" />
                      <span>{row.accountLabel}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Tổng {row.totalCount} lệnh bán</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    <div className={isStockProfitable ? 'text-emerald-400' : 'text-red-400'}>
                      {formatVND(row.stockProfit)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">({row.stockCount} lệnh)</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    <div className={isWarrantProfitable ? 'text-purple-400' : 'text-red-400'}>
                      {formatVND(row.warrantProfit)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">({row.warrantCount} lệnh)</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-sm">
                    <span className={isTotalProfitable ? 'text-emerald-400' : 'text-red-400'}>
                      {formatVND(row.totalProfit)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-950 text-white font-bold border-t-2 border-slate-700 text-xs">
              <td colSpan={2} className="py-3.5 px-4 text-slate-300 font-extrabold uppercase tracking-wider">
                TỔNG CỘNG TẤT CẢ TIỂU KHOẢN
              </td>
              <td className={`py-3.5 px-4 text-right font-mono text-sm font-black ${totalStockProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatVND(totalStockProfit)}
              </td>
              <td className={`py-3.5 px-4 text-right font-mono text-sm font-black ${totalWarrantProfit >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                {formatVND(totalWarrantProfit)}
              </td>
              <td className={`py-3.5 px-4 text-right font-mono text-base font-black ${grandTotalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatVND(grandTotalProfit)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
