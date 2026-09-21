import fs from 'fs';
import * as XLSX from 'xlsx';
import { parseHtmlXls, parseWorkbookXlsx, mergeTrades, calculateSummaryStats } from './src/utils/excelParser';

console.log('--- TESTING MIXED FILE FORMATS (XLS HTML + XLSX Binary + CSV) ---');

// 1. Parse HTML XLS File (VPS format)
const htmlContent = fs.readFileSync('Lailodathuchien (12).xls', 'utf8');
const res1 = parseHtmlXls(htmlContent, 'Lailodathuchien (12).xls (Format: HTML XLS)');

// 2. Create a mock CSV content (TCBS / SSI format) to test CSV parser
const mockCsvString = `Ngày,Mã CK,Khối lượng bán,Giá bán,Phí + Thuế bán,Giá trị bán,Giá vốn,Giá trị vốn,Lãi/Lỗ,%Lãi/Lỗ
15/09/2026,FPT,500,"135,000","67,500","67,432,500","110,000","55,000,000","12,432,500",22.6%
16/09/2026,CFPT2534,2000,500,500,999,500,1000,2000000,-1000500,-50.0%
`;

const wbCsv = XLSX.read(mockCsvString, { type: 'string' });
const res2 = parseWorkbookXlsx(wbCsv, 'BaoCao_TCBS.csv (Format: CSV)');

console.log('\nResult File 1 (VPS HTML XLS):', res1.fileInfo.fileName, `-> ${res1.trades.length} trades`);
console.log('Result File 2 (TCBS CSV):', res2.fileInfo.fileName, `-> ${res2.trades.length} trades`);

// 3. Merge both mixed format files
const merged = mergeTrades([res1, res2]);
console.log('\nTotal Merged Trades from Mixed Formats:', merged.mergedTrades.length);

const stats = calculateSummaryStats(merged.mergedTrades);
console.log('Total Net Profit Combined:', stats.netProfit.toLocaleString('vi-VN'), 'VND');
console.log('Stocks Trades:', stats.stocksStats.tradeCount, '| Warrants Trades:', stats.warrantsStats.tradeCount);
