import React, { useMemo } from 'react';
import { TradeRecord, TickerSummary, SummaryStats } from '../types/stock';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend, CartesianGrid
} from 'recharts';
import { formatVND } from './SummaryCards';
import { TrendingUp, BarChart3, PieChart as PieIcon, Calendar } from 'lucide-react';

interface ChartsDashboardProps {
  trades: TradeRecord[];
  tickerSummaries: TickerSummary[];
  stats: SummaryStats;
}

export const ChartsDashboard: React.FC<ChartsDashboardProps> = ({
  trades,
  tickerSummaries,
  stats
}) => {
  // 1. Prepare Cumulative P&L Time Series Data
  const timeSeriesData = useMemo(() => {
    let runningProfit = 0;
    return trades.map(t => {
      runningProfit += t.profit;
      return {
        date: t.date.split(' ')[0] || t.dateFormatted,
        rawProfit: t.profit,
        cumulativeProfit: runningProfit,
        ticker: t.ticker,
        assetType: t.assetType
      };
    });
  }, [trades]);

  // 2. Prepare Top 7 Winners and Top 7 Losers
  const topTickersData = useMemo(() => {
    const winners = tickerSummaries.filter(t => t.netProfit > 0).slice(0, 6);
    const losers = tickerSummaries.filter(t => t.netProfit < 0).slice(-6).reverse();
    return [...winners, ...losers];
  }, [tickerSummaries]);

  // 3. Prepare Monthly Breakdown Data
  const monthlyData = useMemo(() => {
    const monthsMap = new Map<string, { month: string; profit: number; stocksProfit: number; warrantsProfit: number }>();
    
    trades.forEach(t => {
      const parts = t.date.split(' ')[0].split('/');
      let monthKey = 'Khác';
      if (parts.length === 3) {
        monthKey = `Tháng ${parts[1]}/${parts[2]}`;
      }
      
      const existing = monthsMap.get(monthKey) || {
        month: monthKey,
        profit: 0,
        stocksProfit: 0,
        warrantsProfit: 0
      };
      
      existing.profit += t.profit;
      if (t.assetType === 'STOCK') existing.stocksProfit += t.profit;
      else existing.warrantsProfit += t.profit;

      monthsMap.set(monthKey, existing);
    });

    return Array.from(monthsMap.values());
  }, [trades]);

  // 4. Stock vs Warrant Pie Data
  const pieData = useMemo(() => {
    return [
      { name: 'Chứng khoán (Stock)', value: Math.abs(stats.stocksStats.netProfit), rawProfit: stats.stocksStats.netProfit, color: '#10b981' },
      { name: 'Chứng quyền (Warrant)', value: Math.abs(stats.warrantsStats.netProfit), rawProfit: stats.warrantsStats.netProfit, color: '#8b5cf6' }
    ];
  }, [stats]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-bold text-slate-200">{label || data.ticker || data.month}</p>
          {data.cumulativeProfit !== undefined && (
            <p className="text-slate-300">
              Lãi/Lỗ tích lũy: <strong className={data.cumulativeProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {formatVND(data.cumulativeProfit)}
              </strong>
            </p>
          )}
          {data.netProfit !== undefined && (
            <p className="text-slate-300">
              Lãi/Lỗ ròng: <strong className={data.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {formatVND(data.netProfit)}
              </strong>
            </p>
          )}
          {data.rawProfit !== undefined && data.cumulativeProfit === undefined && (
            <p className="text-slate-300">
              Lãi/Lỗ: <strong className={data.rawProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {formatVND(data.rawProfit)}
              </strong>
            </p>
          )}
          {data.assetType && (
            <p className="text-slate-400 text-[10px]">
              Mã {data.ticker} ({data.assetType === 'WARRANT' ? 'Chứng quyền' : 'Chứng khoán'})
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* CHART 1: CUMULATIVE P&L CURVE */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Đường Lãi / Lỗ Tích Lũy Theo Thời Gian</h3>
              <p className="text-[11px] text-slate-400">Diễn biến tổng tài sản qua từng giao dịch thực hiện</p>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulativeProfit"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#profitGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: TOP WINNERS & LOSERS TICKERS */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Hiệu Suất Theo Mã (Top Lãi & Lỗ)</h3>
              <p className="text-[11px] text-slate-400">So sánh lợi nhuận ròng giữa các mã chứng khoán & chứng quyền</p>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topTickersData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="ticker" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="netProfit" radius={[4, 4, 0, 0]}>
                {topTickersData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.netProfit >= 0 ? '#10b981' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 3: MONTHLY PERFORMANCE */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Kết Quả Theo Tháng</h3>
              <p className="text-[11px] text-slate-400">Tổng kết lời/lỗ theo từng chu kỳ tháng</p>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                {monthlyData.map((entry, index) => (
                  <Cell
                    key={`cell-m-${index}`}
                    fill={entry.profit >= 0 ? '#10b981' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 4: STOCKS VS WARRANTS COMPARISON */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">So Sánh: Chứng Khoán vs Chứng Quyền</h3>
              <p className="text-[11px] text-slate-400">Tỷ trọng hiệu suất đóng góp lợi nhuận danh mục</p>
            </div>
          </div>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`pie-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any, name: any, item: any) => [
                  `${formatVND(item.payload.rawProfit)} (${item.payload.rawProfit >= 0 ? 'Lãi' : 'Lỗ'})`,
                  name
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
