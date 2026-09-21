import fs from 'fs';
import { parseHtmlXls, mergeTrades, calculateSummaryStats, getTickerSummaries } from './src/utils/excelParser.js';

const files = [
  'Lailodathuchien (9).xls',
  'Lailodathuchien (10).xls',
  'Lailodathuchien (11).xls',
  'Lailodathuchien (12).xls',
  'Lailodathuchien (13).xls',
  'Lailodathuchien (14).xls'
];

console.log('--- TESTING XLS PARSER ON LOCAL WORKSPACE FILES ---');

const results = [];
for (const file of files) {
  if (fs.existsSync(file)) {
    const html = fs.readFileSync(file, 'utf8');
    const parseRes = parseHtmlXls(html, file);
    console.log(`File: ${file}`);
    console.log(`  Account: ${parseRes.fileInfo.account}, Name: ${parseRes.fileInfo.nameOwner}`);
    console.log(`  Date Range: ${parseRes.fileInfo.fromDate} - ${parseRes.fileInfo.toDate}`);
    console.log(`  Trades Parsed: ${parseRes.trades.length}, Profit: ${parseRes.fileInfo.totalProfit.toLocaleString('vi-VN')} VND`);
    results.push(parseRes);
  }
}

const merged = mergeTrades(results);
console.log('\n--- MERGED & DEDUPLICATED RESULTS ---');
console.log(`Total Files: ${results.length}`);
console.log(`Total Merged Trades: ${merged.mergedTrades.length}`);
console.log(`Duplicates Removed: ${merged.duplicateCount}`);

const stats = calculateSummaryStats(merged.mergedTrades);
console.log('\n--- OVERALL SUMMARY STATS ---');
console.log(`Net Profit: ${stats.netProfit.toLocaleString('vi-VN')} VND`);
console.log(`Total Sell Value: ${stats.totalSellValue.toLocaleString('vi-VN')} VND`);
console.log(`Total Cost Value: ${stats.totalCostValue.toLocaleString('vi-VN')} VND`);
console.log(`Win Rate: ${stats.winRatePercent.toFixed(2)}% (${stats.winningTrades} W / ${stats.losingTrades} L)`);
console.log(`Profit Factor: ${stats.profitFactor.toFixed(2)}`);

console.log('\n--- STOCKS STATS ---');
console.log(`Trades: ${stats.stocksStats.tradeCount}, Net Profit: ${stats.stocksStats.netProfit.toLocaleString('vi-VN')} VND, Win Rate: ${stats.stocksStats.winRatePercent.toFixed(2)}%`);

console.log('\n--- WARRANTS STATS (CHỨNG QUYỀN) ---');
console.log(`Trades: ${stats.warrantsStats.tradeCount}, Net Profit: ${stats.warrantsStats.netProfit.toLocaleString('vi-VN')} VND, Win Rate: ${stats.warrantsStats.winRatePercent.toFixed(2)}%`);

const tickerSummaries = getTickerSummaries(merged.mergedTrades);
console.log('\n--- TICKER SUMMARIES (TOP 5 WINNERS) ---');
tickerSummaries.slice(0, 5).forEach(t => {
  console.log(`  ${t.ticker} (${t.assetType}): ${t.netProfit.toLocaleString('vi-VN')} VND (${t.tradeCount} trades)`);
});
