import fs from 'fs';
import { parseHtmlXls, parseWorkbookXlsx, mergeTrades, calculateSummaryStats, getTickerSummaries } from './src/utils/excelParser';
import * as XLSX from 'xlsx';

const files = [
  'Lailodathuchien (9).xls',
  'Lailodathuchien (10).xls',
  'Lailodathuchien (11).xls',
  'Lailodathuchien (12).xls',
  'Lailodathuchien (13).xls',
  'Lailodathuchien (14).xls',
  'KH - LS lãi lỗ (21).xlsx',
  'KH - LS lãi lỗ (22).xlsx',
  'KH - LS lãi lỗ (23).xlsx'
];

console.log('=== PARSING ALL 9 WORKSPACE FILES (6 VPS + 3 DNSE) ===\n');

const results = [];
for (const file of files) {
  if (fs.existsSync(file)) {
    if (file.endsWith('.xls')) {
      const html = fs.readFileSync(file, 'utf8');
      const parseRes = parseHtmlXls(html, file);
      console.log(`[VPS XLS] ${file}`);
      console.log(`  Account: ${parseRes.fileInfo.account}, Owner: ${parseRes.fileInfo.nameOwner}`);
      console.log(`  Trades: ${parseRes.trades.length}, Profit: ${parseRes.fileInfo.totalProfit.toLocaleString('vi-VN')} VND\n`);
      results.push(parseRes);
    } else if (file.endsWith('.xlsx')) {
      const buf = fs.readFileSync(file);
      const wb = XLSX.read(buf, { type: 'buffer' });
      const parseRes = parseWorkbookXlsx(wb, file);
      console.log(`[DNSE XLSX] ${file}`);
      console.log(`  Account: ${parseRes.fileInfo.account}, Owner: ${parseRes.fileInfo.nameOwner}`);
      console.log(`  Trades: ${parseRes.trades.length}, Profit: ${parseRes.fileInfo.totalProfit.toLocaleString('vi-VN')} VND\n`);
      results.push(parseRes);
    }
  }
}

const merged = mergeTrades(results);
console.log('===================================================');
console.log('=== MERGED & DEDUPLICATED RESULTS (ALL 9 FILES) ===');
console.log(`Total Files Processed: ${results.length}`);
console.log(`Total Merged Trades: ${merged.mergedTrades.length}`);
console.log(`Duplicates Removed: ${merged.duplicateCount}`);

const stats = calculateSummaryStats(merged.mergedTrades);
console.log('\n--- OVERALL COMBINED PORTFOLIO SUMMARY ---');
console.log(`Net Profit: ${stats.netProfit.toLocaleString('vi-VN')} VND`);
console.log(`Total Sell Value: ${stats.totalSellValue.toLocaleString('vi-VN')} VND`);
console.log(`Total Cost Value: ${stats.totalCostValue.toLocaleString('vi-VN')} VND`);
console.log(`Total Fees & Tax: ${stats.totalFeeAndTax.toLocaleString('vi-VN')} VND`);
console.log(`Overall ROI: ${stats.overallRoiPercent.toFixed(2)}%`);
console.log(`Win Rate: ${stats.winRatePercent.toFixed(2)}% (${stats.winningTrades} W / ${stats.losingTrades} L)`);

console.log('\n--- STOCKS STATS (CHỨNG KHOÁN) ---');
console.log(`Trades: ${stats.stocksStats.tradeCount}, Net Profit: ${stats.stocksStats.netProfit.toLocaleString('vi-VN')} VND, Win Rate: ${stats.stocksStats.winRatePercent.toFixed(2)}%`);

console.log('\n--- WARRANTS STATS (CHỨNG QUYỀN) ---');
console.log(`Trades: ${stats.warrantsStats.tradeCount}, Net Profit: ${stats.warrantsStats.netProfit.toLocaleString('vi-VN')} VND, Win Rate: ${stats.warrantsStats.winRatePercent.toFixed(2)}%`);
