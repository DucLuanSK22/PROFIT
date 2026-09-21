import { AssetType } from '../types/stock';

/**
 * Classifies a stock ticker into STOCK or WARRANT (Chứng quyền).
 * Covered Warrants in Vietnam stock market follow standard HOSE syntax:
 * Starts with 'C' + 2-3 letter underlying symbol + issuer/series numbers, 8 characters total.
 * Examples: CFPT2534, CACB2510, CHPG2607, CVPB2401, CMWG2305
 */
export function classifyTicker(tickerRaw: string): AssetType {
  const ticker = tickerRaw.trim().toUpperCase();
  
  if (!ticker) return 'STOCK';

  // Pattern for Covered Warrants:
  // Starts with 'C', exactly 8 characters long, contains both letters and numbers
  // E.g., CFPT2534, CACB2510, CHPG2607
  const warrantPattern = /^C[A-Z]{2,4}[0-9]{2,4}$/;

  if (ticker.length === 8 && ticker.startsWith('C') && warrantPattern.test(ticker)) {
    return 'WARRANT';
  }

  // Backup check: starts with C and 8 characters long with digits inside
  if (ticker.length === 8 && ticker.startsWith('C') && /\d/.test(ticker)) {
    return 'WARRANT';
  }

  return 'STOCK';
}

export function getAssetTypeName(assetType: AssetType): string {
  return assetType === 'WARRANT' ? 'Chứng quyền' : 'Chứng khoán';
}
