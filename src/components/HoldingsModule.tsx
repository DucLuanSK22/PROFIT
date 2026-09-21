import React, { useState } from 'react';
import { OpenPosition, AccountData } from '../types/stock';
import { formatVND, formatPercent } from './SummaryCards';
import { Briefcase, TrendingUp, PlusCircle, Tag, PieChart as PieIcon, DollarSign, Layers } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface HoldingsModuleProps {
  accountData: AccountData;
  onUpdateHoldings: (holdings: OpenPosition[]) => void;
}

export const HoldingsModule: React.FC<HoldingsModuleProps> = ({ accountData, onUpdateHoldings }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [tickerInput, setTickerInput] = useState('');
  const [volumeInput, setVolumeInput] = useState('');
  const [avgCostInput, setAvgCostInput] = useState('');
  const [currentPriceInput, setCurrentPriceInput] = useState('');

  const holdings = accountData.holdings || [];

  const totalCostValue = holdings.reduce((s, h) => s + h.totalCostValue, 0);
  const totalMarketValue = holdings.reduce((s, h) => s + h.currentMarketValue, 0);
  const totalUnrealizedProfit = totalMarketValue - totalCostValue;
  const totalUnrealizedPercent = totalCostValue > 0 ? (totalUnrealizedProfit / totalCostValue) * 100 : 0;

  const isProfit = totalUnrealizedProfit >= 0;

  // Pie chart data by ticker allocation
  const pieData = holdings.map(h => ({
    name: h.ticker,
    value: h.currentMarketValue
  }));

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1'];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tk = tickerInput.trim().toUpperCase();
    const vol = parseFloat(volumeInput.replace(/,/g, ''));
    const costP = parseFloat(avgCostInput.replace(/,/g, ''));
    const currP = parseFloat(currentPriceInput.replace(/,/g, ''));

    if (!tk || isNaN(vol) || isNaN(costP) || isNaN(currP) || vol <= 0) return;

    const isWarrant = tk.length === 8 && tk.startsWith('C');
    const costVal = vol * costP;
    const marketVal = vol * currP;
    const unprofit = marketVal - costVal;
    const unpct = costVal > 0 ? (unprofit / costVal) * 100 : 0;

    const newPosition: OpenPosition = {
      id: `hold_${Date.now()}`,
      ticker: tk,
      assetType: isWarrant ? 'WARRANT' : 'STOCK',
      volume: vol,
      avgCostPrice: costP,
      currentPrice: currP,
      totalCostValue: costVal,
      currentMarketValue: marketVal,
      unrealizedProfit: unprofit,
      unrealizedProfitPercent: unpct
    };

    const updated = [...holdings, newPosition];
    onUpdateHoldings(updated);

    setShowAddModal(false);
    setTickerInput('');
    setVolumeInput('');
    setAvgCostInput('');
    setCurrentPriceInput('');
  };

  const handleDeleteHolding = (id: string) => {
    const updated = holdings.filter(h => h.id !== id);
    onUpdateHoldings(updated);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-outfit flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <span>Danh Mục Đang Nắm Giữ ({accountData.name})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Quản lý các vị thế cổ phiếu & chứng quyền đang mở (Unrealized P&L)</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/20 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Thêm Vị Thế Nắm Giữ</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Market Value */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Giá Trị Thị Trường</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-white font-mono">{formatVND(totalMarketValue)}</div>
          <div className="text-[11px] text-slate-400">{holdings.length} mã đang nắm giữ</div>
        </div>

        {/* 2. Total Cost Value */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tổng Giá Trị Vốn</span>
            <div className="p-2 rounded-xl bg-slate-800 text-slate-400 border border-slate-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-200 font-mono">{formatVND(totalCostValue)}</div>
          <div className="text-[11px] text-slate-400">Vốn mua danh mục</div>
        </div>

        {/* 3. Unrealized P&L */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Lãi / Lỗ Tạm Tính</span>
            <div className={`p-2 rounded-xl border ${isProfit ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl font-extrabold font-mono ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatVND(totalUnrealizedProfit)}
          </div>
          <div className="text-[11px] text-slate-400">Chưa chốt lời/cắt lỗ</div>
        </div>

        {/* 4. Unrealized Profit % */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">% Lãi / Lỗ Tạm Tính</span>
            <div className={`p-2 rounded-xl border ${isProfit ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              <PieIcon className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl font-extrabold font-mono ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatPercent(totalUnrealizedPercent)}
          </div>
          <div className="text-[11px] text-slate-400">Tỷ suất LN tạm tính</div>
        </div>
      </div>

      {/* Asset Allocation Pie Chart */}
      {holdings.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <PieIcon className="w-4 h-4 text-purple-400" />
            <span>Biểu Đồ Phân Bổ Tỷ Trọng Danh Mục (Portfolio Asset Allocation)</span>
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [formatVND(Number(val)), 'Giá trị thị trường']}
                />
                <Legend formatter={(val) => <span className="text-xs text-slate-300 font-bold">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Open Holdings Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-purple-400" />
            <span>Danh Sách Mã Đang Nắm Giữ ({holdings.length} mã)</span>
          </h3>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/90 text-slate-300 uppercase tracking-wider text-[11px] font-bold border-b border-slate-800 select-none">
              <tr>
                <th className="py-3.5 px-4">Mã CK</th>
                <th className="py-3.5 px-3">Loại Tài Sản</th>
                <th className="py-3.5 px-3 text-right">KL Sở Hữu</th>
                <th className="py-3.5 px-3 text-right">Giá Vốn TB</th>
                <th className="py-3.5 px-3 text-right">Giá Hiện Tại</th>
                <th className="py-3.5 px-3 text-right">Giá Trị Vốn</th>
                <th className="py-3.5 px-3 text-right">Giá Trị Thị Trường</th>
                <th className="py-3.5 px-4 text-right">Lãi/Lỗ Tạm Tính</th>
                <th className="py-3.5 px-4 text-right">% Tạm Tính</th>
                <th className="py-3.5 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {holdings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    Chưa có vị thế nắm giữ nào. Bấm "Thêm Vị Thế Nắm Giữ" để nhập.
                  </td>
                </tr>
              ) : (
                holdings.map((h) => {
                  const itemProfit = h.unrealizedProfit >= 0;

                  return (
                    <tr key={h.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-extrabold text-white text-sm font-outfit">{h.ticker}</td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold text-[11px] border ${
                          h.assetType === 'WARRANT'
                            ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                            : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        }`}>
                          <Tag className="w-3 h-3" />
                          <span>{h.assetType === 'WARRANT' ? 'Chứng quyền' : 'Chứng khoán'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-medium">{h.volume.toLocaleString('vi-VN')}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-300">{h.avgCostPrice.toLocaleString('vi-VN')}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-100 font-bold">{h.currentPrice.toLocaleString('vi-VN')}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-400">{h.totalCostValue.toLocaleString('vi-VN')}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-100 font-bold">{h.currentMarketValue.toLocaleString('vi-VN')}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs ${
                          itemProfit ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30' : 'text-red-400 bg-red-500/20 border border-red-500/40'
                        }`}>
                          {formatVND(h.unrealizedProfit)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs ${
                          itemProfit ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30' : 'text-red-400 bg-red-500/20 border border-red-500/40'
                        }`}>
                          {formatPercent(h.unrealizedProfitPercent)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handleDeleteHolding(h.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all text-xs font-semibold cursor-pointer"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Position Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-purple-400" />
              <span>Thêm Vị Thế Nắm Giữ</span>
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mã Chứng Khoán / Chứng Quyền</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: HPG, FPT, CHPG2607..."
                  value={tickerInput}
                  onChange={(e) => setTickerInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm uppercase focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Khối Lượng Nắm Giữ</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 1,000"
                  value={volumeInput}
                  onChange={(e) => setVolumeInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Giá Vốn Trung Bình (VNĐ)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 26,500"
                  value={avgCostInput}
                  onChange={(e) => setAvgCostInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Giá Thị Trường Hiện Tại (VNĐ)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 28,800"
                  value={currentPriceInput}
                  onChange={(e) => setCurrentPriceInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500"
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  Lưu Vị Thế
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
