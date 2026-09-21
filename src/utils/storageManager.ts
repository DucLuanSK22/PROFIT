import { MultiAccountState, AccountKey, AccountData, TradeRecord, CashTransaction, OpenPosition } from '../types/stock';
import { getInitialState } from './sampleDataGenerator';

const STORAGE_KEY = 'INVESTMENT_DASHBOARD_3ACCOUNTS_V1';

export function loadMultiAccountState(): MultiAccountState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return getInitialState();
    const parsed = JSON.parse(saved);
    if (parsed && parsed.accounts && parsed.accounts.ACCOUNT_1) {
      // Ensure all required fields exist for each account to prevent runtime crashes
      const initial = getInitialState();
      Object.keys(parsed.accounts).forEach(k => {
        const acc = parsed.accounts[k];
        if (acc) {
          acc.trades = Array.isArray(acc.trades) ? acc.trades : [];
          acc.cashTxns = Array.isArray(acc.cashTxns) ? acc.cashTxns : [];
          acc.holdings = Array.isArray(acc.holdings) ? acc.holdings : [];
          acc.fileInfos = Array.isArray(acc.fileInfos) ? acc.fileInfos : [];
        }
      });
      // Ensure default accounts exist
      ['ACCOUNT_1', 'ACCOUNT_2', 'ACCOUNT_3'].forEach(k => {
        if (!parsed.accounts[k]) {
          parsed.accounts[k] = initial.accounts[k as AccountKey];
        }
      });
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
  }
  return getInitialState();
}

export function saveMultiAccountState(state: MultiAccountState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function exportBackupJson(state: MultiAccountState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `Backup_Dashboard_3TaiKhoan_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export async function importBackupJson(file: File): Promise<MultiAccountState> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!parsed || !parsed.accounts || !parsed.accounts.ACCOUNT_1) {
    throw new Error('File JSON không đúng định dạng sao lưu 3 Tài Khoản');
  }
  saveMultiAccountState(parsed);
  return parsed;
}

export function resetToSampleData(): MultiAccountState {
  const fresh = getInitialState();
  saveMultiAccountState(fresh);
  return fresh;
}
