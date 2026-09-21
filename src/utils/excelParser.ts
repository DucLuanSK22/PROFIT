import * as XLSX from 'xlsx';
import { TradeRecord, UploadedFileInfo, SummaryStats, TickerSummary, AssetSubStats } from '../types/stock';
import { classifyTicker } from './classifier';

export function cleanNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  
  let str = String(val)
    .replace(/<[^>]+>/g, '') // remove HTML tags
    .replace(/&nbsp;/g, '')
    .replace(/%/g, '')
    .replace(/,/g, '')
    .replace(/\s+/g, '')
    .trim();

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export function cleanText(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, '')
    .trim();
}

/**
 * Parses and strictly normalizes date strings into standard DD/MM/YYYY HH:mm:ss format
 * Handles VPS (DD/MM/YYYY HH:mm:ss), DNSE (HH:mm:ss DD/MM/YYYY or DD/MM/YYYY HH:mm), JS dates, ISO dates
 */
export function parseDateToMillis(dateStr: string): { timestamp: number; dateFormatted: string; dateNormalized: string } {
  const cleanStr = cleanText(dateStr).replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanStr) return { timestamp: 0, dateFormatted: '', dateNormalized: '' };

  // Handle SheetJS JS Date / ISO string
  if (cleanStr.includes('T') && cleanStr.includes('Z')) {
    const d = new Date(cleanStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hour = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const sec = String(d.getSeconds()).padStart(2, '0');
      return {
        timestamp: d.getTime(),
        dateFormatted: `${year}-${month}-${day}`,
        dateNormalized: `${day}/${month}/${year} ${hour}:${min}:${sec}`
      };
    }
  }

  const parts = cleanStr.split(/\s+/);
  let datePart = '';
  let timePart = '00:00:00';

  if (parts.length >= 2) {
    if (parts[0].includes(':')) {
      timePart = parts[0];
      datePart = parts[1];
    } else {
      datePart = parts[0];
      timePart = parts[1];
    }
  } else {
    datePart = parts[0];
  }

  const dParts = datePart.includes('/') ? datePart.split('/') : datePart.split('-');
  
  if (dParts.length === 3) {
    let day = 1, month = 1, year = 2026;
    
    if (dParts[0].length === 4) {
      year = parseInt(dParts[0], 10);
      month = parseInt(dParts[1], 10);
      day = parseInt(dParts[2], 10);
    } else {
      day = parseInt(dParts[0], 10);
      month = parseInt(dParts[1], 10);
      year = parseInt(dParts[2], 10);
    }

    const tParts = timePart.split(':');
    const hour = parseInt(tParts[0] || '0', 10);
    const minute = parseInt(tParts[1] || '0', 10);
    const second = parseInt(tParts[2] || '0', 10);

    const d = new Date(year, month - 1, day, hour, minute, second);
    const yearStr = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    const hourStr = String(d.getHours()).padStart(2, '0');
    const minStr = String(d.getMinutes()).padStart(2, '0');
    const secStr = String(d.getSeconds()).padStart(2, '0');
    
    return {
      timestamp: d.getTime(),
      dateFormatted: `${yearStr}-${monthStr}-${dayStr}`,
      dateNormalized: `${dayStr}/${monthStr}/${yearStr} ${hourStr}:${minStr}:${secStr}`
    };
  }

  return { timestamp: 0, dateFormatted: '', dateNormalized: cleanStr };
}

/**
 * Generate unique hash ID for deduplicating trades across VPS, DNSE, TCBS, SSI, etc.
 */
export function generateTradeId(account: string, dateStr: string, ticker: string, sellVol: number, sellPrice: number, costValue: number): string {
  const cleanAcc = account.replace(/'/g, '').trim().toUpperCase() || 'UNKNOWN';
  const cleanTk = ticker.trim().toUpperCase();
  return `${cleanAcc}_${cleanText(dateStr)}_${cleanTk}_${sellVol}_${sellPrice}_${costValue}`;
}

export interface ParseFileResult {
  fileInfo: UploadedFileInfo;
  trades: TradeRecord[];
}

/**
 * Detect Broker Name from file content (VPS, DNSE, TCBS, SSI, HSC, VNDIRECT, MBS, VPBankS)
 */
export function detectBrokerName(text: string): string {
  const upper = text.toUpperCase();
  if (upper.includes('VPS')) return 'VPS';
  if (upper.includes('DNSE') || upper.includes('ENTRADE')) return 'DNSE';
  if (upper.includes('TCBS') || upper.includes('TECHCOM')) return 'TCBS';
  if (upper.includes('SSI')) return 'SSI';
  if (upper.includes('HSC') || upper.includes('THÀNH CÔNG')) return 'HSC';
  if (upper.includes('VNDIRECT') || upper.includes('VND')) return 'VNDIRECT';
  if (upper.includes('MBS')) return 'MBS';
  if (upper.includes('VPBANKS') || upper.includes('VPBANK')) return 'VPBankS';
  return 'Công ty CK';
}

export interface ColumnIndices {
  dateIdx: number;
  tickerIdx: number;
  sellVolIdx: number;
  sellPriceIdx: number;
  feeTaxIdx: number;
  sellValIdx: number;
  costPriceIdx: number;
  costValIdx: number;
  profitIdx: number;
  profitPctIdx: number;
}

export function matchHeaderColumns(headerCells: string[]): ColumnIndices {
  let dateIdx = -1;
  let tickerIdx = -1;
  let sellVolIdx = -1;
  let sellPriceIdx = -1;
  let feeTaxIdx = -1;
  let sellValIdx = -1;
  let costPriceIdx = -1;
  let costValIdx = -1;
  let profitIdx = -1;
  let profitPctIdx = -1;

  headerCells.forEach((rawCell, idx) => {
    const c = rawCell.toLowerCase().replace(/<[^>]+>/g, '').trim();

    // Ignore margin cash ratio columns like 'tỷ lệ tiền mặt'
    if (c.includes('tỷ lệ tiền') || c.includes('tỷ lệ margin') || c.includes('tiền mặt')) {
      return;
    }

    if (dateIdx === -1 && (c.includes('ngày') || c.includes('date') || c.includes('thời gian') || c.includes('time'))) {
      dateIdx = idx;
    }
    if (tickerIdx === -1 && (c.includes('mã') || c.includes('symbol') || c.includes('ticker') || c.includes('chứng khoán'))) {
      if (!c.includes('tên')) tickerIdx = idx;
    }
    if (sellVolIdx === -1 && (c.includes('khối lượng') || c.includes('số lượng') || c.includes('kl') || c.includes('volume') || c.includes('qty'))) {
      sellVolIdx = idx;
    }
    if (sellPriceIdx === -1 && (c.includes('giá bán') || c.includes('giá khớp') || c.includes('sell price') || (c.includes('giá') && !c.includes('vốn') && !c.includes('mua')))) {
      sellPriceIdx = idx;
    }
    if (feeTaxIdx === -1 && (c.includes('phí') || c.includes('thuế') || c.includes('fee') || c.includes('tax'))) {
      feeTaxIdx = idx;
    }
    if (sellValIdx === -1 && (c.includes('giá trị bán') || c.includes('thành tiền bán') || c.includes('doanh thu') || c.includes('sell value') || c.includes('thành tiền'))) {
      sellValIdx = idx;
    }
    if (costPriceIdx === -1 && (c.includes('giá vốn') || c.includes('cost price') || c.includes('giá mua') || c.includes('giá tb'))) {
      costPriceIdx = idx;
    }
    if (costValIdx === -1 && (c.includes('giá trị vốn') || c.includes('tổng giá vốn') || c.includes('tổng vốn') || c.includes('cost value'))) {
      costValIdx = idx;
    }
    if (profitIdx === -1 && (c.includes('lãi/lỗ') || c.includes('lãi lỗ') || c.includes('lợi nhuận') || c.includes('lời/lỗ') || c.includes('p&l') || c.includes('pnl') || c.includes('profit'))) {
      if (!c.includes('%')) profitIdx = idx;
    }
    if (profitPctIdx === -1) {
      if ((c.includes('lãi') || c.includes('lỗ') || c.includes('roi') || c.includes('profit') || c.includes('pnl')) && c.includes('%')) {
        profitPctIdx = idx;
      }
    }
  });

  if (dateIdx === -1) dateIdx = 0;
  if (tickerIdx === -1) tickerIdx = 1;
  if (sellVolIdx === -1) sellVolIdx = 2;
  if (sellPriceIdx === -1) sellPriceIdx = 3;
  if (feeTaxIdx === -1) feeTaxIdx = 4;
  if (sellValIdx === -1) sellValIdx = 5;
  if (costPriceIdx === -1) costPriceIdx = 6;
  if (costValIdx === -1) costValIdx = 7;
  if (profitIdx === -1) profitIdx = 8;
  if (profitPctIdx === -1) profitPctIdx = -1;

  return {
    dateIdx,
    tickerIdx,
    sellVolIdx,
    sellPriceIdx,
    feeTaxIdx,
    sellValIdx,
    costPriceIdx,
    costValIdx,
    profitIdx,
    profitPctIdx
  };
}

export async function parseExcelFile(file: File): Promise<ParseFileResult> {
  const textContent = await file.text();
  
  if (textContent.includes('<html') || textContent.includes('<table')) {
    return parseHtmlXls(textContent, file.name);
  }

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  return parseWorkbookXlsx(workbook, file.name);
}

export function parseHtmlXls(htmlContent: string, fileName: string): ParseFileResult {
  const brokerName = detectBrokerName(htmlContent);
  let account = 'N/A';
  let nameOwner = 'N/A';
  let fromDate = '';
  let toDate = '';

  const trades: TradeRecord[] = [];

  const accMatch = htmlContent.match(/lblAccountID[^>]*>[\s\S]*?<b>\s*'?([^<]+)/i) || 
                   htmlContent.match(/Tài khoản[\s\S]*?<b>\s*'?([^<]+)/i) ||
                   htmlContent.match(/Tài khoản\s*:?\s*<b>\s*'?([^\s<]+)/i) ||
                   htmlContent.match(/Số tài khoản\s*:?\s*([^\s<]+)/i);
  if (accMatch) account = cleanText(accMatch[1]).replace(/'/g, '');

  const nameMatch = htmlContent.match(/lblName[^>]*>[\s\S]*?<b>\s*([^<]+)/i) || 
                    htmlContent.match(/Họ tên[\s\S]*?<b>\s*([^<]+)/i) ||
                    htmlContent.match(/Tên khách hàng\s*:?\s*([^|\n<]+)/i);
  if (nameMatch) nameOwner = cleanText(nameMatch[1]);

  const fromMatch = htmlContent.match(/lblFromDate[^>]*>\s*([^<]+)/i) || htmlContent.match(/Từ ngày\s*:?\s*([0-9/]+)/i);
  if (fromMatch) fromDate = cleanText(fromMatch[1]);

  const toMatch = htmlContent.match(/lblToDate[^>]*>\s*([^<]+)/i) || htmlContent.match(/Đến ngày\s*:?\s*([0-9/]+)/i);
  if (toMatch) toDate = cleanText(toMatch[1]);

  const trMatches = htmlContent.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  let colMap: ColumnIndices = {
    dateIdx: 0, tickerIdx: 1, sellVolIdx: 2, sellPriceIdx: 3, feeTaxIdx: 4,
    sellValIdx: 5, costPriceIdx: 6, costValIdx: 7, profitIdx: 8, profitPctIdx: 9
  };

  for (const trHtml of trMatches) {
    const tdMatches = trHtml.match(/<td[\s\S]*?<\/td>/gi) || trHtml.match(/<th[\s\S]*?<\/th>/gi) || [];
    const cells = tdMatches.map(td => td.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').trim());

    if (cells.length < 5) continue;

    const rowText = cells.join(' ').toLowerCase();

    if (rowText.includes('mã chứng khoán') || rowText.includes('mã ck') || rowText.includes('giá trị bán') || rowText.includes('khối lượng bán') || rowText.includes('symbol')) {
      colMap = matchHeaderColumns(cells);
      continue;
    }

    const dateRaw = cleanText(cells[colMap.dateIdx] || cells[0]);
    const ticker = cleanText(cells[colMap.tickerIdx] || cells[1]).toUpperCase();

    if (!dateRaw || !ticker || ticker === 'MÃ CHỨNG KHOÁN' || ticker === 'MÃ CK' || ticker === 'MÃ' || ticker === 'SYMBOL' || ticker === 'STT') continue;
    if (dateRaw.includes('Từ ngày') || dateRaw.includes('Công ty') || !/\d/.test(dateRaw)) continue;

    let sellVolume = cleanNumber(cells[colMap.sellVolIdx]);
    let sellPrice = cleanNumber(cells[colMap.sellPriceIdx]);
    let feeAndTax = cleanNumber(cells[colMap.feeTaxIdx]);
    let sellValue = cleanNumber(cells[colMap.sellValIdx]);
    let costPrice = cleanNumber(cells[colMap.costPriceIdx]);
    let costValue = cleanNumber(cells[colMap.costValIdx]);
    let profit = cleanNumber(cells[colMap.profitIdx]);

    if (sellPrice > 0 && sellPrice < 500) sellPrice = sellPrice * 1000;
    if (costPrice > 0 && costPrice < 500) costPrice = costPrice * 1000;

    if (sellValue === 0 || (sellValue < costValue / 10 && sellPrice > 0)) {
      sellValue = sellVolume * sellPrice;
    }
    if (costValue === 0 || (costValue < sellValue / 10 && costPrice > 0)) {
      costValue = sellVolume * costPrice;
    }

    if (profit === 0 && sellValue > 0 && costValue > 0) {
      profit = sellValue - costValue - feeAndTax;
    }

    const profitPercent = costValue > 0 ? (profit / costValue) * 100 : 0;

    if (sellVolume <= 0 && sellValue <= 0 && costValue <= 0) continue;

    const { timestamp, dateFormatted, dateNormalized } = parseDateToMillis(dateRaw);
    const assetType = classifyTicker(ticker);
    const id = generateTradeId(account, dateNormalized, ticker, sellVolume, sellPrice, costValue);

    trades.push({
      id,
      date: dateNormalized, // Standardized DD/MM/YYYY HH:mm:ss
      timestamp,
      dateFormatted,
      ticker,
      assetType,
      sellVolume,
      sellPrice,
      feeAndTax,
      sellValue,
      costPrice,
      costValue,
      profit,
      profitPercent,
      account: account !== 'N/A' ? `${account} (${brokerName})` : brokerName,
      sourceFile: fileName
    });
  }

  const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);

  return {
    fileInfo: {
      fileName,
      account: account !== 'N/A' ? `${account} (${brokerName})` : brokerName,
      nameOwner,
      fromDate,
      toDate,
      tradeCount: trades.length,
      totalProfit
    },
    trades
  };
}

export function parseWorkbookXlsx(workbook: XLSX.WorkBook, fileName: string): ParseFileResult {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, raw: false });

  const rawText = jsonData.map(r => (r || []).join(' ')).join('\n');
  const brokerName = detectBrokerName(rawText);

  let account = 'N/A';
  let nameOwner = 'N/A';
  let fromDate = '';
  let toDate = '';

  const trades: TradeRecord[] = [];
  let colMap: ColumnIndices = {
    dateIdx: 0, tickerIdx: 1, sellVolIdx: 2, sellPriceIdx: 3, feeTaxIdx: 4,
    sellValIdx: 5, costPriceIdx: 6, costValIdx: 7, profitIdx: 8, profitPctIdx: 9
  };

  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;

    const rowStr = row.map((cell: any) => String(cell)).join(' ');

    if (rowStr.includes('Tài khoản') || rowStr.includes('Account') || rowStr.includes('Số tài khoản:')) {
      const match = rowStr.match(/(?:LL|ll|\d{6,10}|[0-9A-Z]{8,12})\w*/);
      if (match) account = match[0];
      if (rowStr.includes('Số tài khoản:')) {
        const parts = rowStr.split('Số tài khoản:');
        if (parts[1]) account = cleanText(parts[1]).split(' ')[0];
      }
    }
    if (rowStr.includes('Họ tên') || rowStr.includes('Name') || rowStr.includes('Tên khách hàng:')) {
      const parts = rowStr.split(/Họ tên:|Name:|Tên khách hàng:/);
      if (parts[1]) nameOwner = cleanText(parts[1]).split('|')[0];
    }
    if (rowStr.includes('Từ ngày') && rowStr.includes('đến ngày')) {
      const parts = rowStr.split(/Từ ngày|đến ngày/);
      if (parts[1]) fromDate = cleanText(parts[1]);
      if (parts[2]) toDate = cleanText(parts[2]);
    }

    const rowLower = rowStr.toLowerCase();
    if (rowLower.includes('mã') || rowLower.includes('symbol') || rowLower.includes('ngày') || rowLower.includes('khối lượng') || rowLower.includes('lãi') || rowLower.includes('thời gian bán')) {
      if (row.length >= 4 && !rowLower.includes('báo cáo') && !rowLower.includes('công ty')) {
        colMap = matchHeaderColumns(row.map(c => String(c)));
        continue;
      }
    }

    if (row.length >= 5) {
      const dateRaw = cleanText(row[colMap.dateIdx] || row[0]);
      const ticker = cleanText(row[colMap.tickerIdx] || row[1]).toUpperCase();

      if (dateRaw && ticker && ticker.length >= 3 && /\d/.test(dateRaw) && !dateRaw.includes('Mã') && !dateRaw.includes('Symbol') && !dateRaw.includes('STT')) {
        let sellVolume = cleanNumber(row[colMap.sellVolIdx]);
        let sellPrice = cleanNumber(row[colMap.sellPriceIdx]);
        let feeAndTax = cleanNumber(row[colMap.feeTaxIdx]);
        let sellValue = cleanNumber(row[colMap.sellValIdx]);
        let costPrice = cleanNumber(row[colMap.costPriceIdx]);
        let costValue = cleanNumber(row[colMap.costValIdx]);
        let profit = cleanNumber(row[colMap.profitIdx]);

        // Extra fee parsing (e.g. DNSE fee + tax + margin interest)
        if (brokerName === 'DNSE' && row.length >= 10) {
          const feeVal = cleanNumber(row[7]);
          const taxVal = cleanNumber(row[8]);
          const marginVal = cleanNumber(row[9]);
          feeAndTax = feeVal + taxVal + marginVal;
        }

        // Prices in thousands VND
        if (sellPrice > 0 && sellPrice < 500) sellPrice = sellPrice * 1000;
        if (costPrice > 0 && costPrice < 500) costPrice = costPrice * 1000;

        // Recompute exact sellValue & costValue
        sellValue = sellVolume * sellPrice;
        costValue = sellVolume * costPrice;

        if (profit === 0 && sellValue > 0 && costValue > 0) {
          profit = sellValue - costValue - feeAndTax;
        }

        // Mathematically precise Profit % = (Profit / Total Cost Value) * 100
        const profitPercent = costValue > 0 ? (profit / costValue) * 100 : 0;

        if (sellVolume > 0 || sellValue > 0 || costValue > 0) {
          const { timestamp, dateFormatted, dateNormalized } = parseDateToMillis(dateRaw);
          const assetType = classifyTicker(ticker);
          const id = generateTradeId(account, dateNormalized, ticker, sellVolume, sellPrice, costValue);

          trades.push({
            id,
            date: dateNormalized, // Standardized DD/MM/YYYY HH:mm:ss
            timestamp,
            dateFormatted,
            ticker,
            assetType,
            sellVolume,
            sellPrice,
            feeAndTax,
            sellValue,
            costPrice,
            costValue,
            profit,
            profitPercent,
            account: account !== 'N/A' ? `${account} (${brokerName})` : brokerName,
            sourceFile: fileName
          });
        }
      }
    }
  }

  const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);

  return {
    fileInfo: {
      fileName,
      account: account !== 'N/A' ? `${account} (${brokerName})` : brokerName,
      nameOwner,
      fromDate,
      toDate,
      tradeCount: trades.length,
      totalProfit
    },
    trades
  };
}

export function mergeTrades(allParsedResults: ParseFileResult[]): {
  mergedTrades: TradeRecord[];
  fileInfos: UploadedFileInfo[];
  duplicateCount: number;
} {
  const tradeMap = new Map<string, TradeRecord>();
  let duplicateCount = 0;
  const fileInfos = allParsedResults.map(r => r.fileInfo);

  for (const res of allParsedResults) {
    for (const trade of res.trades) {
      if (tradeMap.has(trade.id)) {
        duplicateCount++;
      } else {
        tradeMap.set(trade.id, trade);
      }
    }
  }

  const mergedTrades = Array.from(tradeMap.values());
  mergedTrades.sort((a, b) => a.timestamp - b.timestamp);

  return {
    mergedTrades,
    fileInfos,
    duplicateCount
  };
}

function calculateSubStats(trades: TradeRecord[]): AssetSubStats {
  const tradeCount = trades.length;
  const netProfit = trades.reduce((sum, t) => sum + t.profit, 0);
  const totalSellValue = trades.reduce((sum, t) => sum + t.sellValue, 0);
  const totalCostValue = trades.reduce((sum, t) => sum + t.costValue, 0);
  const totalFeeAndTax = trades.reduce((sum, t) => sum + t.feeAndTax, 0);

  const winningTrades = trades.filter(t => t.profit > 0).length;
  const losingTrades = trades.filter(t => t.profit < 0).length;
  const winRatePercent = tradeCount > 0 ? (winningTrades / tradeCount) * 100 : 0;
  const roiPercent = totalCostValue > 0 ? (netProfit / totalCostValue) * 100 : 0;

  return {
    tradeCount,
    netProfit,
    totalSellValue,
    totalCostValue,
    totalFeeAndTax,
    winningTrades,
    losingTrades,
    winRatePercent,
    roiPercent
  };
}

export function calculateSummaryStats(trades: TradeRecord[]): SummaryStats {
  const totalTrades = trades.length;
  const totalSellValue = trades.reduce((sum, t) => sum + t.sellValue, 0);
  const totalCostValue = trades.reduce((sum, t) => sum + t.costValue, 0);
  const totalFeeAndTax = trades.reduce((sum, t) => sum + t.feeAndTax, 0);
  const netProfit = trades.reduce((sum, t) => sum + t.profit, 0);
  const overallRoiPercent = totalCostValue > 0 ? (netProfit / totalCostValue) * 100 : 0;

  const winningTradesList = trades.filter(t => t.profit > 0);
  const losingTradesList = trades.filter(t => t.profit < 0);
  const breakevenTrades = trades.filter(t => t.profit === 0).length;

  const winningTrades = winningTradesList.length;
  const losingTrades = losingTradesList.length;
  const winRatePercent = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const grossProfit = winningTradesList.reduce((sum, t) => sum + t.profit, 0);
  const grossLoss = Math.abs(losingTradesList.reduce((sum, t) => sum + t.profit, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.9 : 0;

  let maxProfitTrade: TradeRecord | null = null;
  let maxLossTrade: TradeRecord | null = null;

  if (trades.length > 0) {
    maxProfitTrade = [...trades].sort((a, b) => b.profit - a.profit)[0] || null;
    maxLossTrade = [...trades].sort((a, b) => a.profit - b.profit)[0] || null;
  }

  const stocks = trades.filter(t => t.assetType === 'STOCK');
  const warrants = trades.filter(t => t.assetType === 'WARRANT');

  return {
    totalTrades,
    totalSellValue,
    totalCostValue,
    totalFeeAndTax,
    netProfit,
    overallRoiPercent,
    winningTrades,
    losingTrades,
    breakevenTrades,
    winRatePercent,
    profitFactor,
    maxProfitTrade,
    maxLossTrade,
    stocksStats: calculateSubStats(stocks),
    warrantsStats: calculateSubStats(warrants)
  };
}

export function getTickerSummaries(trades: TradeRecord[]): TickerSummary[] {
  const map = new Map<string, TickerSummary>();

  for (const t of trades) {
    const existing = map.get(t.ticker) || {
      ticker: t.ticker,
      assetType: t.assetType,
      tradeCount: 0,
      totalVolume: 0,
      totalSellValue: 0,
      totalCostValue: 0,
      totalFeeAndTax: 0,
      netProfit: 0,
      roiPercent: 0,
      winRatePercent: 0
    };

    existing.tradeCount += 1;
    existing.totalVolume += t.sellVolume;
    existing.totalSellValue += t.sellValue;
    existing.totalCostValue += t.costValue;
    existing.totalFeeAndTax += t.feeAndTax;
    existing.netProfit += t.profit;

    map.set(t.ticker, existing);
  }

  const summaries = Array.from(map.values()).map(s => {
    s.roiPercent = s.totalCostValue > 0 ? (s.netProfit / s.totalCostValue) * 100 : 0;
    const tickerTrades = trades.filter(t => t.ticker === s.ticker);
    const wins = tickerTrades.filter(t => t.profit > 0).length;
    s.winRatePercent = tickerTrades.length > 0 ? (wins / tickerTrades.length) * 100 : 0;
    return s;
  });

  summaries.sort((a, b) => b.netProfit - a.netProfit);
  return summaries;
}
