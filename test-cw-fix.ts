import fs from 'fs';
import * as XLSX from 'xlsx';
import { parseHtmlXls, parseWorkbookXlsx, matchHeaderColumns } from './src/utils/excelParser';

const file = 'KH - LS lãi lỗ (21).xlsx';
const buf = fs.readFileSync(file);
const wb = XLSX.read(buf, { type: 'buffer' });
const parseRes = parseWorkbookXlsx(wb, file);

console.log('=== DNSE CW TRADES AFTER FIX ===');
parseRes.trades.filter(t => t.assetType === 'WARRANT').forEach(t => {
  console.log(`Ticker: ${t.ticker} | Vol: ${t.sellVolume} | SellVal: ${t.sellValue.toLocaleString()} | CostVal: ${t.costValue.toLocaleString()} | Profit: ${t.profit.toLocaleString()} VND | ProfitPct: ${t.profitPercent.toFixed(2)}%`);
});
