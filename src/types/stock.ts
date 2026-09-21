export type AssetType = 'STOCK' | 'WARRANT';

export type UserRole = 'ADMIN' | 'ACCOUNT_1' | 'ACCOUNT_2' | 'ACCOUNT_3';
export type AccountKey = 'ACCOUNT_1' | 'ACCOUNT_2' | 'ACCOUNT_3';
export type ActiveModule = 'REALIZED_PNL' | 'CASHFLOW' | 'HOLDINGS' | 'GROUP_SUMMARY';

export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  activeAccountKey: AccountKey;
  userName: string;
}

export interface TradeRecord {
  id: string;
  date: string;              // "15/09/2025 13:12:14"
  timestamp: number;         // Date millis
  dateFormatted: string;     // "YYYY-MM-DD"
  ticker: string;            // "HDC", "CFPT2534"
  assetType: AssetType;      // 'STOCK' or 'WARRANT'
  sellVolume: number;        // Khối lượng bán
  sellPrice: number;         // Giá bán
  feeAndTax: number;         // Phí + Thuế bán
  sellValue: number;         // Giá trị bán
  costPrice: number;         // Giá vốn
  costValue: number;         // Giá trị vốn
  profit: number;            // Lãi/Lỗ (VND)
  profitPercent: number;     // % Lãi/Lỗ
  account: string;           // Tài khoản (e.g. "LL22366")
  sourceFile: string;        // Tên file gốc
  manualOverride?: boolean;  // True if user manually toggled classification
}

export interface CashTransaction {
  id: string;
  date: string;              // "DD/MM/YYYY"
  timestamp: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'FEE' | 'MARGIN_INTEREST';
  amount: number;
  note: string;
  sourceFile?: string;
}

export interface OpenPosition {
  id: string;
  ticker: string;
  assetType: AssetType;
  volume: number;
  avgCostPrice: number;
  currentPrice: number;
  totalCostValue: number;
  currentMarketValue: number;
  unrealizedProfit: number;
  unrealizedProfitPercent: number;
}

export interface UploadedFileInfo {
  fileName: string;
  account: string;
  nameOwner: string;
  fromDate: string;
  toDate: string;
  tradeCount: number;
  totalProfit: number;
}

export interface AssetSubStats {
  tradeCount: number;
  netProfit: number;
  totalSellValue: number;
  totalCostValue: number;
  totalFeeAndTax: number;
  winningTrades: number;
  losingTrades: number;
  winRatePercent: number;
  roiPercent: number;
}

export interface SummaryStats {
  totalTrades: number;
  totalSellValue: number;
  totalCostValue: number;
  totalFeeAndTax: number;
  netProfit: number;
  overallRoiPercent: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRatePercent: number;
  profitFactor: number;
  maxProfitTrade: TradeRecord | null;
  maxLossTrade: TradeRecord | null;
  stocksStats: AssetSubStats;
  warrantsStats: AssetSubStats;
}

export interface TickerSummary {
  ticker: string;
  assetType: AssetType;
  tradeCount: number;
  totalVolume: number;
  totalSellValue: number;
  totalCostValue: number;
  totalFeeAndTax: number;
  netProfit: number;
  roiPercent: number;
  winRatePercent: number;
}

export interface AccountData {
  key: AccountKey;
  name: string;             // Display name, e.g. "Tài khoản 1 (Của Tôi)"
  ownerName: string;        // Owner full name, e.g. "Nguyễn Văn A"
  accountNumber: string;    // e.g. "0001234 (VPS)"
  broker: string;           // "VPS", "DNSE", "TCBS"
  pin: string;              // Access PIN code
  trades: TradeRecord[];
  cashTxns: CashTransaction[];
  holdings: OpenPosition[];
  fileInfos: UploadedFileInfo[];
}

export interface MultiAccountState {
  accounts: Record<AccountKey, AccountData>;
}
