import fs from 'fs';
import * as XLSX from 'xlsx';
import { parseHtmlXls, parseWorkbookXlsx, parseDateToMillis } from './src/utils/excelParser';

const files = [
  'Lailodathuchien (12).xls',
  'KH - LS lãi lỗ (21).xlsx',
  'KH - LS lãi lỗ (22).xlsx',
  'KH - LS lãi lỗ (23).xlsx'
];

console.log('--- TESTING DATE NORMALIZER ON ALL FILES ---');

files.forEach(f => {
  let res;
  if (f.endsWith('.xls')) {
    res = parseHtmlXls(fs.readFileSync(f, 'utf8'), f);
  } else {
    res = parseWorkbookXlsx(XLSX.read(fs.readFileSync(f), {type:'buffer'}), f);
  }

  console.log(`\n=== FILE: ${f} (${res.trades.length} trades) ===`);
  res.trades.slice(0, 5).forEach(t => {
    console.log(`  Raw: "${t.date}" -> Normalized: "${t.date}" (Timestamp: ${t.timestamp})`);
  });
});
