import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { TradeRecord } from '../types/stock';
import { formatVND, formatPercent } from './SummaryCards';
import { Search, Download, ArrowUpDown, ArrowUp, ArrowDown, Tag, Filter, RotateCcw, FileSpreadsheet } from 'lucide-react';
import { ExcelColumnFilter } from './ExcelColumnFilter';

interface TradeTableProps {
  trades: TradeRecord[];
  accounts: string[];
}

export const TradeTable: React.FC<TradeTableProps> = ({ trades, accounts }) => {
  const [selectedAssetTab, setSelectedAssetTab] = useState<'ALL' | 'STOCK' | 'WARRANT'>('ALL');
  const [winLossFilter, setWinLossFilter] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const [accountFilter, setAccountFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Excel Column Filters State: Map of column key -> Set of selected values
  const [columnFilters, setColumnFilters] = useState<Record<string, Set<string>>>({});

  // Sort State
  const [sortField, setSortField] = useState<keyof TradeRecord>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Helper to extract unique display values for a column
  const getUniqueColumnValues = (field: keyof TradeRecord): string[] => {
    const set = new Set<string>();
    trades.forEach(t => {
      let val = t[field];
      if (field === 'assetType') {
        val = t.assetType === 'WARRANT' ? 'Chứng quyền' : 'Chứng khoán';
      } else if (field === 'sellVolume' || field === 'sellPrice' || field === 'feeAndTax' || field === 'sellValue' || field === 'costPrice' || field === 'costValue') {
        val = Number(val).toLocaleString('vi-VN');
      } else if (field === 'profit') {
        val = formatVND(Number(val));
      } else if (field === 'profitPercent') {
        val = formatPercent(Number(val));
      }
      set.add(String(val !== undefined && val !== null ? val : ''));
    });
    return Array.from(set).sort();
  };

  // Pre-calculate unique values for all columns
  const uniqueValuesMap = useMemo(() => {
    return {
      date: getUniqueColumnValues('date'),
      account: getUniqueColumnValues('account'),
      ticker: getUniqueColumnValues('ticker'),
      assetType: getUniqueColumnValues('assetType'),
      sellVolume: getUniqueColumnValues('sellVolume'),
      sellPrice: getUniqueColumnValues('sellPrice'),
      feeAndTax: getUniqueColumnValues('feeAndTax'),
      sellValue: getUniqueColumnValues('sellValue'),
      costPrice: getUniqueColumnValues('costPrice'),
      costValue: getUniqueColumnValues('costValue'),
      profit: getUniqueColumnValues('profit'),
      profitPercent: getUniqueColumnValues('profitPercent')
    };
  }, [trades]);

  // Handle column selection change
  const handleColumnFilterChange = (field: string, newSelected: Set<string>) => {
    setColumnFilters(prev => ({
      ...prev,
      [field]: newSelected
    }));
    setCurrentPage(1);
  };

  // Reset all Excel column filters
  const handleResetAllColumnFilters = () => {
    setColumnFilters({});
    setSelectedAssetTab('ALL');
    setWinLossFilter('ALL');
    setAccountFilter('ALL');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Check if any Excel column filter is active
  const isAnyFilterActive = useMemo(() => {
    if (selectedAssetTab !== 'ALL' || winLossFilter !== 'ALL' || accountFilter !== 'ALL' || searchQuery.trim() !== '') return true;
    for (const [key, selectedSet] of Object.entries(columnFilters)) {
      const allVals = (uniqueValuesMap as any)[key] || [];
      if (selectedSet && selectedSet.size < allVals.length) return true;
    }
    return false;
  }, [columnFilters, uniqueValuesMap, selectedAssetTab, winLossFilter, accountFilter, searchQuery]);

  // Main Filter Logic (Global Filters + Excel Column Filters)
  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      // 1. Asset type tab
      if (selectedAssetTab !== 'ALL' && t.assetType !== selectedAssetTab) return false;

      // 2. Account dropdown filter
      if (accountFilter !== 'ALL' && t.account !== accountFilter) return false;

      // 3. Win / Loss dropdown filter
      if (winLossFilter === 'WIN' && t.profit <= 0) return false;
      if (winLossFilter === 'LOSS' && t.profit >= 0) return false;

      // 4. Global Search
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTicker = t.ticker.toLowerCase().includes(q);
        const matchAccount = t.account.toLowerCase().includes(q);
        const matchDate = t.date.toLowerCase().includes(q);
        if (!matchTicker && !matchAccount && !matchDate) return false;
      }

      // 5. Excel Column Filters
      for (const [field, selectedSet] of Object.entries(columnFilters)) {
        if (!selectedSet) continue;
        let cellVal: any = (t as any)[field];
        if (field === 'assetType') {
          cellVal = t.assetType === 'WARRANT' ? 'Chứng quyền' : 'Chứng khoán';
        } else if (field === 'sellVolume' || field === 'sellPrice' || field === 'feeAndTax' || field === 'sellValue' || field === 'costPrice' || field === 'costValue') {
          cellVal = Number(cellVal).toLocaleString('vi-VN');
        } else if (field === 'profit') {
          cellVal = formatVND(Number(cellVal));
        } else if (field === 'profitPercent') {
          cellVal = formatPercent(Number(cellVal));
        }

        const cellStr = String(cellVal !== undefined && cellVal !== null ? cellVal : '');
        if (!selectedSet.has(cellStr)) return false;
      }

      return true;
    });
  }, [trades, selectedAssetTab, accountFilter, winLossFilter, searchQuery, columnFilters]);

  // Sort Logic across ALL columns
  const sortedTrades = useMemo(() => {
    return [...filteredTrades].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTrades, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedTrades.length / pageSize) || 1;
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTrades.slice(start, start + pageSize);
  }, [sortedTrades, currentPage, pageSize]);

  const handleSort = (field: keyof TradeRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const renderSortIcon = (field: keyof TradeRecord) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-blue-400 font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-400 font-bold" />
    );
  };

  // Helper for column filter component props
  const getFilterProps = (fieldKey: keyof TradeRecord, title: string, isNumeric = false) => {
    const uniqueVals = (uniqueValuesMap as any)[fieldKey] || [];
    const selectedVals = columnFilters[fieldKey] || new Set(uniqueVals);

    return {
      columnKey: fieldKey,
      columnTitle: title,
      uniqueValues: uniqueVals,
      selectedValues: selectedVals,
      onSelectValuesChange: (newSet: Set<string>) => handleColumnFilterChange(fieldKey, newSet),
      isNumeric,
      onSortAsc: () => {
        setSortField(fieldKey);
        setSortOrder('asc');
      },
      onSortDesc: () => {
        setSortField(fieldKey);
        setSortOrder('desc');
      },
      currentSortField: sortField,
      currentSortOrder: sortOrder
    };
  };

  /**
   * Helper to format numbers cleanly without 'đ' suffix for Excel export
   */
  const formatNumClean = (val: number): string => {
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  /**
   * Export Excel with Rich Formatting:
   * - Clean Numbers without 'đ' suffix so Excel can sum and calculate formulas
  /**
   * Export Native Binary XLSX File (.xlsx) using SheetJS
   * Direct native .xlsx file without Excel warning dialogs on open
   */
  const handleExportExcelXlsx = () => {
    const headers = [
      'STT',
      'Ngày / Giờ',
      'Tài Khoản / Công Ty',
      'Mã CK',
      'Loại Tài Sản',
      'Khối Lượng Bán',
      'Giá Bán (VNĐ)',
      'Phí + Thuế (VNĐ)',
      'Giá Trị Bán (VNĐ)',
      'Giá Vốn (VNĐ)',
      'Giá Trị Vốn (VNĐ)',
      'Lãi / Lỗ (VNĐ)',
      '% Lãi / Lỗ',
      'File Nguồn'
    ];

    const dataRows = sortedTrades.map((t, idx) => [
      idx + 1,
      t.date,
      t.account,
      t.ticker,
      t.assetType === 'WARRANT' ? 'Chứng quyền' : 'Chứng khoán',
      t.sellVolume,
      t.sellPrice,
      t.feeAndTax,
      t.sellValue,
      t.costPrice,
      t.costValue,
      t.profit,
      t.profitPercent / 100,
      t.sourceFile
    ]);

    const totalSellVal = sortedTrades.reduce((s, t) => s + t.sellValue, 0);
    const totalCostVal = sortedTrades.reduce((s, t) => s + t.costValue, 0);
    const totalFee = sortedTrades.reduce((s, t) => s + t.feeAndTax, 0);
    const totalProfit = sortedTrades.reduce((s, t) => s + t.profit, 0);
    const totalRoi = totalCostVal > 0 ? (totalProfit / totalCostVal) * 100 : 0;

    const totalRow = [
      `TỔNG CỘNG (${sortedTrades.length} LỆNH)`,
      '', '', '', '',
      '', '',
      totalFee,
      totalSellVal,
      '',
      totalCostVal,
      totalProfit,
      totalRoi / 100,
      ''
    ];

    const wsData = [
      ['BÁO CÁO LÃI LỖ ĐÃ THỰC HIỆN TỔNG HỢP'],
      [`Thời gian xuất: ${new Date().toLocaleString('vi-VN')} | Tổng số lệnh: ${sortedTrades.length}`],
      [],
      headers,
      ...dataRows,
      [],
      totalRow
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Merge title & total summary headers
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 13 } },
      { s: { r: wsData.length - 1, c: 0 }, e: { r: wsData.length - 1, c: 4 } }
    ];

    // Auto-fit Column Widths
    ws['!cols'] = [
      { wch: 6 },  // STT
      { wch: 22 }, // Ngay/Gio
      { wch: 26 }, // Tai Khoan
      { wch: 12 }, // Ma CK
      { wch: 16 }, // Loai Tai San
      { wch: 16 }, // KL Ban
      { wch: 16 }, // Gia Ban
      { wch: 16 }, // Phi Thuế
      { wch: 20 }, // Gia Tri Ban
      { wch: 16 }, // Gia Von
      { wch: 20 }, // Gia Tri Von
      { wch: 20 }, // Lai/Lo
      { wch: 14 }, // % Lai/Lo
      { wch: 32 }  // File Nguon
    ];

    // Format numbers for data rows
    dataRows.forEach((_, rIdx) => {
      const rowNum = rIdx + 4; // Data rows start at row index 4
      [5, 6, 7, 8, 9, 10, 11].forEach(cIdx => {
        const cellRef = XLSX.utils.encode_cell({ r: rowNum, c: cIdx });
        if (ws[cellRef]) {
          ws[cellRef].z = cIdx === 11 ? '#,##0;[Red]-#,##0' : '#,##0';
        }
      });
      const pctRef = XLSX.utils.encode_cell({ r: rowNum, c: 12 });
      if (ws[pctRef]) {
        ws[pctRef].z = '+0.00%;[Red]-0.00%;0.00%';
      }
    });

    // Format numbers for summary row
    const totalRowNum = wsData.length - 1;
    [7, 8, 10, 11].forEach(cIdx => {
      const cellRef = XLSX.utils.encode_cell({ r: totalRowNum, c: cIdx });
      if (ws[cellRef]) {
        ws[cellRef].z = cIdx === 11 ? '#,##0;[Red]-#,##0' : '#,##0';
      }
    });
    const totalPctRef = XLSX.utils.encode_cell({ r: totalRowNum, c: 12 });
    if (ws[totalPctRef]) {
      ws[totalPctRef].z = '+0.00%;[Red]-0.00%;0.00%';
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Báo Cáo Lãi Lỗ');

    XLSX.writeFile(wb, `BaoCao_LaiLo_ThucHien_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  /**
   * Export Excel with Rich HTML Formatting (.xls)
   */
  const handleExportExcelFormatted = () => {
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; }
          .title-row { font-size: 14pt; font-weight: bold; color: #0F172A; text-align: center; padding: 10px; }
          .sub-title { font-size: 9pt; color: #64748B; text-align: center; padding-bottom: 10px; }
          th { background-color: #BAE6FD; color: #0369A1; font-weight: bold; text-align: center; border: 1px solid #94A3B8; padding: 8px 12px; font-size: 10.5pt; }
          td { border: 1px solid #CBD5E1; padding: 6px 10px; }
          .center { text-align: center; }
          .right { text-align: right; }
          .left { text-align: left; }
          .profit-row { color: #047857; font-weight: 500; }
          .loss-row { color: #DC2626; font-weight: 500; }
          .profit-val { color: #047857; font-weight: bold; }
          .loss-val { color: #DC2626; font-weight: bold; }
          .total-row { background-color: #E2E8F0; font-weight: bold; font-size: 10.5pt; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="14" class="title-row">BÁO CÁO LÃI LỖ ĐÃ THỰC HIỆN TỔNG HỢP</td></tr>
          <tr><td colspan="14" class="sub-title"><i>Thời gian xuất file: ${new Date().toLocaleString('vi-VN')} | Tổng số lệnh: ${sortedTrades.length}</i></td></tr>
          <tr><td colspan="14"></td></tr>
          <thead>
            <tr>
              <th>STT</th>
              <th>Ngày / Giờ</th>
              <th>Tài Khoản / Công Ty</th>
              <th>Mã CK</th>
              <th>Loại Tài Sản</th>
              <th>Khối Lượng Bán</th>
              <th>Giá Bán (VNĐ)</th>
              <th>Phí + Thuế (VNĐ)</th>
              <th>Giá Trị Bán (VNĐ)</th>
              <th>Giá Vốn (VNĐ)</th>
              <th>Giá Trị Vốn (VNĐ)</th>
              <th>Lãi / Lỗ (VNĐ)</th>
              <th>% Lãi / Lỗ</th>
              <th>File Nguồn</th>
            </tr>
          </thead>
          <tbody>
    `;

    sortedTrades.forEach((t, idx) => {
      const isProfit = t.profit > 0;
      const isLoss = t.profit < 0;
      const rowClass = isProfit ? 'profit-row' : isLoss ? 'loss-row' : '';
      const profitClass = isProfit ? 'profit-val' : isLoss ? 'loss-val' : '';

      html += `
        <tr class="${rowClass}">
          <td class="center">${idx + 1}</td>
          <td class="center">${t.date}</td>
          <td class="left">${t.account}</td>
          <td class="center"><b>${t.ticker}</b></td>
          <td class="center">${t.assetType === 'WARRANT' ? 'Chứng quyền' : 'Chứng khoán'}</td>
          <td class="right">${t.sellVolume.toLocaleString('vi-VN')}</td>
          <td class="right">${t.sellPrice.toLocaleString('vi-VN')}</td>
          <td class="right">${t.feeAndTax.toLocaleString('vi-VN')}</td>
          <td class="right">${t.sellValue.toLocaleString('vi-VN')}</td>
          <td class="right">${t.costPrice.toLocaleString('vi-VN')}</td>
          <td class="right">${t.costValue.toLocaleString('vi-VN')}</td>
          <td class="right ${profitClass}">${formatNumClean(t.profit)}</td>
          <td class="right ${profitClass}">${formatPercent(t.profitPercent)}</td>
          <td class="left">${t.sourceFile}</td>
        </tr>
      `;
    });

    // Total summary row
    const totalSellVal = sortedTrades.reduce((s, t) => s + t.sellValue, 0);
    const totalCostVal = sortedTrades.reduce((s, t) => s + t.costValue, 0);
    const totalFee = sortedTrades.reduce((s, t) => s + t.feeAndTax, 0);
    const totalProfit = sortedTrades.reduce((s, t) => s + t.profit, 0);
    const totalRoi = totalCostVal > 0 ? (totalProfit / totalCostVal) * 100 : 0;
    const totalProfitClass = totalProfit >= 0 ? 'profit-val' : 'loss-val';

    html += `
          <tr class="total-row">
            <td colspan="5" class="center"><b>TỔNG CỘNG (${sortedTrades.length} LỆNH)</b></td>
            <td class="right"></td>
            <td class="right"></td>
            <td class="right">${totalFee.toLocaleString('vi-VN')}</td>
            <td class="right">${totalSellVal.toLocaleString('vi-VN')}</td>
            <td class="right"></td>
            <td class="right">${totalCostVal.toLocaleString('vi-VN')}</td>
            <td class="right ${totalProfitClass}">${formatNumClean(totalProfit)}</td>
            <td class="right ${totalProfitClass}">${formatPercent(totalRoi)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
    `;

    const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BaoCao_LaiLo_Formatted_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const countStocks = trades.filter(t => t.assetType === 'STOCK').length;
  const countWarrants = trades.filter(t => t.assetType === 'WARRANT').length;

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl space-y-4 w-full">
      {/* Top Controls & Filter Bar */}
      <div className="p-5 border-b border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
        {/* Asset Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => { setSelectedAssetTab('ALL'); setCurrentPage(1); }}
            className={`px-3.5 py-2 rounded-lg transition-all ${
              selectedAssetTab === 'ALL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tất cả ({trades.length})
          </button>
          <button
            onClick={() => { setSelectedAssetTab('STOCK'); setCurrentPage(1); }}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-all ${
              selectedAssetTab === 'STOCK'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Chứng khoán ({countStocks})</span>
          </button>
          <button
            onClick={() => { setSelectedAssetTab('WARRANT'); setCurrentPage(1); }}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-all ${
              selectedAssetTab === 'WARRANT'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>Chứng quyền ({countWarrants})</span>
          </button>
        </div>

        {/* Global Filters & Reset All */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {isAnyFilterActive && (
            <button
              onClick={handleResetAllColumnFilters}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold hover:bg-amber-500/20 transition-all"
              title="Xóa tất cả bộ lọc nâng cao"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc Excel</span>
            </button>
          )}

          {/* Account Filter */}
          {accounts.length > 0 && (
            <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={accountFilter}
                onChange={(e) => { setAccountFilter(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">Tất cả Tài Khoản</option>
                {accounts.map(acc => (
                  <option key={acc} value={acc} className="bg-slate-900">{acc}</option>
                ))}
              </select>
            </div>
          )}

          {/* Win/Loss Filter */}
          <select
            value={winLossFilter}
            onChange={(e) => { setWinLossFilter(e.target.value as any); setCurrentPage(1); }}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả Lãi/Lỗ</option>
            <option value="WIN">Chỉ lệnh Thắng (Lãi)</option>
            <option value="LOSS">Chỉ lệnh Thua (Lỗ)</option>
          </select>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm mã CK, ngày, TK..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-blue-500 w-44 sm:w-60"
            />
          </div>

          {/* Download Native XLSX Button */}
          <button
            onClick={handleExportExcelXlsx}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            title="Tải về file Excel chuẩn định dạng .xlsx (Mở trực tiếp không bị cảnh báo định dạng)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Tải File .XLSX</span>
          </button>

          {/* HTML XLS Button with Styling */}
          <button
            onClick={handleExportExcelFormatted}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all border border-slate-700 cursor-pointer"
            title="Xuất file HTML Excel có bôi màu tiêu đề xanh nhạt, chữ Lãi xanh, chữ Lỗ đỏ"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Xuất HTML .XLS (Màu)</span>
          </button>
        </div>
      </div>

      {/* Main Table with Excel Style Dropdown Filters on EVERY Header Cell - Full Width Display */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-950/95 text-slate-300 uppercase tracking-wider text-[11px] font-bold border-b border-slate-800 select-none">
            <tr>
              {/* 1. DATE */}
              <th className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">
                <div className="flex items-center justify-between space-x-2">
                  <span className="cursor-pointer hover:text-white flex items-center space-x-1" onClick={() => handleSort('timestamp')}>
                    <span>Ngày/Giờ</span>
                    {renderSortIcon('timestamp')}
                  </span>
                  <ExcelColumnFilter {...getFilterProps('date', 'Ngày/Giờ')} />
                </div>
              </th>

              {/* 2. ACCOUNT */}
              <th className="py-3.5 px-3 whitespace-nowrap min-w-[150px]">
                <div className="flex items-center justify-between space-x-2">
                  <span className="cursor-pointer hover:text-white flex items-center space-x-1" onClick={() => handleSort('account')}>
                    <span>Tài khoản / Công ty</span>
                    {renderSortIcon('account')}
                  </span>
                  <ExcelColumnFilter {...getFilterProps('account', 'Tài khoản')} />
                </div>
              </th>

              {/* 3. TICKER */}
              <th className="py-3.5 px-3 whitespace-nowrap min-w-[100px]">
                <div className="flex items-center justify-between space-x-2">
                  <span className="cursor-pointer hover:text-white flex items-center space-x-1" onClick={() => handleSort('ticker')}>
                    <span>Mã CK</span>
                    {renderSortIcon('ticker')}
                  </span>
                  <ExcelColumnFilter {...getFilterProps('ticker', 'Mã CK')} />
                </div>
              </th>

              {/* 4. ASSET TYPE */}
              <th className="py-3.5 px-3 whitespace-nowrap min-w-[130px]">
                <div className="flex items-center justify-between space-x-2">
                  <span className="cursor-pointer hover:text-white flex items-center space-x-1" onClick={() => handleSort('assetType')}>
                    <span>Loại Tài Sản</span>
                    {renderSortIcon('assetType')}
                  </span>
                  <ExcelColumnFilter {...getFilterProps('assetType', 'Loại Tài Sản')} />
                </div>
              </th>

              {/* 5. SELL VOL */}
              <th className="py-3.5 px-3 text-right whitespace-nowrap min-w-[100px]">
                <div className="flex items-center justify-end space-x-1.5">
                  <span className="cursor-pointer hover:text-white flex items-center space-x-1" onClick={() => handleSort('sellVolume')}>
                    <span>KL Bán</span>
                    {renderSortIcon('sellVolume')}
                  </span>
                  <ExcelColumnFilter {...getFilterProps('sellVolume', 'KL Bán', true)} />
                </div>
              </th>

              {/* 6. SELL PRICE */}
              <th className="py-3.5 px-3 text-right whitespace-nowrap min-w-[110px]">
                <div className="flex items-center justify-end space-x-1.5">
                  <span className="cursor-pointer hover:text-white flex items-center space-x-1" onClick={() => handleSort('sellPrice')}>
                    <span>Giá Bán</span>
                    {renderSortIcon('sellPrice')}
                  </span>
                  <ExcelColumnFilter {...getFilterProps('sellPrice', 'Giá Bán', true)} />
                </div>
              </th>

              {/* 7. FEE TAX */}
              <th className="py-3.5 px-3 text-right whitespace-nowrap min-w-[110px]">
                <div className="flex items-center justify-end space-x-1.5">
                  <span className="cursor-pointer hover:text-white flex items-center space-x-1" onClick={() => handleSort('feeAndTax')}>
                    <span>Phí+Thuế</span>
                    {renderSortIcon('feeAndTax')}
                  </span>
                  <ExcelColumnFilter {...getFilterProps('feeAndTax', 'Phí+Thuế', true)} />
                </div>
              </th>

              {/* 8. SELL VALUE */}
              <th className="py-3.5 px-3 text-right whitespace-nowrap min-w-[130px]">
                <div className="flex items-center justify-end space-x-1.5">
                  <span className="cursor-pointer hover:text-white flex items-center space-x-1" onClick={() => handleSort('sellValue')}>
                    <span>Giá Trị Bán</span>
                    {renderSortIcon('sellValue')}
                  </span>
                  <ExcelColumnFilter {...getFilterProps('sellValue', 'Giá Trị Bán', true)} />
                </div>
              </th>

              {/* 9. COST PRICE */}
              <th className="py-3.5 px-3 text-right whitespace-nowrap min-w-[110px]">
                <div className="flex items-center justify-end space-x-1.5">
                  <span className="cursor-pointer hover:text-white flex items-center space-x-1" onClick={() => handleSort('costPrice')}>
                    <span>Giá Vốn</span>
                    {renderSortIcon('costPrice')}
                  </span>
                  <ExcelColumnFilter {...getFilterProps('costPrice', 'Giá Vốn', true)} />
                </div>
              </th>

              {/* 10. COST VALUE */}
              <th className="py-3.5 px-3 text-right whitespace-nowrap min-w-[130px]">
                <div className="flex items-center justify-end space-x-1.5">
                  <span className="cursor-pointer hover:text-white flex items-center space-x-1" onClick={() => handleSort('costValue')}>
                    <span>Giá Trị Vốn</span>
                    {renderSortIcon('costValue')}
                  </span>
                  <ExcelColumnFilter {...getFilterProps('costValue', 'Giá Trị Vốn', true)} />
                </div>
              </th>

              {/* 11. PROFIT */}
              <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[150px]">
                <div className="flex items-center justify-end space-x-1.5">
                  <span className="cursor-pointer hover:text-white flex items-center space-x-1" onClick={() => handleSort('profit')}>
                    <span>Lãi / Lỗ</span>
                    {renderSortIcon('profit')}
                  </span>
                  <ExcelColumnFilter {...getFilterProps('profit', 'Lãi / Lỗ', true)} />
                </div>
              </th>

              {/* 12. PROFIT PCT */}
              <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[120px]">
                <div className="flex items-center justify-end space-x-1.5">
                  <span className="cursor-pointer hover:text-white flex items-center space-x-1" onClick={() => handleSort('profitPercent')}>
                    <span>% Lãi/Lỗ</span>
                    {renderSortIcon('profitPercent')}
                  </span>
                  <ExcelColumnFilter {...getFilterProps('profitPercent', '% Lãi/Lỗ', true)} />
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {paginatedTrades.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-400 font-medium">
                  Không tìm thấy lệnh giao dịch phù hợp với các bộ lọc
                </td>
              </tr>
            ) : (
              paginatedTrades.map((t) => {
                const isProfit = t.profit > 0;
                const isLoss = t.profit < 0;

                return (
                  <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {t.date}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap font-mono font-semibold text-slate-200">
                      {t.account}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-extrabold text-white font-outfit text-sm tracking-wide">
                        {t.ticker}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] border ${
                        t.assetType === 'WARRANT'
                          ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                          : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      }`}>
                        <Tag className="w-3 h-3" />
                        <span>{t.assetType === 'WARRANT' ? 'Chứng quyền' : 'Chứng khoán'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono font-medium text-slate-200">
                      {t.sellVolume.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono text-slate-300">
                      {t.sellPrice.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono text-amber-400 font-semibold">
                      {t.feeAndTax.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono font-bold text-slate-100">
                      {t.sellValue.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono text-slate-400">
                      {t.costPrice.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono text-slate-400">
                      {t.costValue.toLocaleString('vi-VN')}
                    </td>

                    {/* VIVID PROFIT / LOSS COLUMN WITH HIGH CONTRAST COLORS */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-sm font-extrabold shadow-sm ${
                        isProfit
                          ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                          : isLoss
                          ? 'text-red-400 bg-red-500/20 border border-red-500/40'
                          : 'text-slate-400 bg-slate-800/40'
                      }`}>
                        {formatVND(t.profit)}
                      </span>
                    </td>

                    {/* VIVID PROFIT % COLUMN */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-sm ${
                        isProfit
                          ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                          : isLoss
                          ? 'text-red-400 bg-red-500/20 border border-red-500/40'
                          : 'text-slate-400 bg-slate-800/40'
                      }`}>
                        {formatPercent(t.profitPercent)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          Hiển thị <strong>{paginatedTrades.length}</strong> / <strong>{filteredTrades.length}</strong> lệnh giao dịch
          (Trang {currentPage} / {totalPages})
        </div>

        <div className="flex items-center space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="px-3.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          >
            Trang trước
          </button>
          <span className="px-3 font-mono text-slate-200 font-bold">{currentPage}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="px-3.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          >
            Trang sau
          </button>

          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value={15}>15 lệnh / trang</option>
            <option value={25}>25 lệnh / trang</option>
            <option value={50}>50 lệnh / trang</option>
            <option value={100}>100 lệnh / trang</option>
          </select>
        </div>
      </div>
    </div>
  );
};
