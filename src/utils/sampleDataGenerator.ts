import { MultiAccountState, AccountData, TradeRecord, CashTransaction, OpenPosition } from '../types/stock';

export const ADMIN_PIN = '8888';

export const DEFAULT_ACCOUNTS: Record<'ACCOUNT_1', AccountData> = {
  ACCOUNT_1: {
    key: 'ACCOUNT_1',
    name: 'Tài Khoản Mẫu (Demo)',
    ownerName: 'Tài Khoản Mẫu',
    accountNumber: 'DEMO888 (VPS)',
    broker: 'VPS',
    pin: '1234',
    trades: [
      {
        id: 'acc1_t1',
        date: '15/09/2026 10:15:00',
        timestamp: new Date('2026-09-15T10:15:00').getTime(),
        dateFormatted: '2026-09-15',
        ticker: 'HDC',
        assetType: 'STOCK',
        sellVolume: 1000,
        sellPrice: 32500,
        feeAndTax: 125000,
        sellValue: 32500000,
        costPrice: 28000,
        costValue: 28000000,
        profit: 4375000,
        profitPercent: 15.625,
        account: 'DEMO888 (VPS)',
        sourceFile: 'Lailodathuchien (14).xls'
      },
      {
        id: 'acc1_t2',
        date: '16/09/2026 10:32:26',
        timestamp: new Date('2026-09-16T10:32:26').getTime(),
        dateFormatted: '2026-09-16',
        ticker: 'PLX',
        assetType: 'STOCK',
        sellVolume: 300,
        sellPrice: 38800,
        feeAndTax: 29100,
        sellValue: 11640000,
        costPrice: 40513,
        costValue: 12153900,
        profit: -543000,
        profitPercent: -4.467,
        account: 'DEMO888 (VPS)',
        sourceFile: 'Lailodathuchien (14).xls'
      },
      {
        id: 'acc1_t3',
        date: '18/09/2026 14:05:00',
        timestamp: new Date('2026-09-18T14:05:00').getTime(),
        dateFormatted: '2026-09-18',
        ticker: 'CFPT2534',
        assetType: 'WARRANT',
        sellVolume: 5000,
        sellPrice: 1850,
        feeAndTax: 25000,
        sellValue: 9250000,
        costPrice: 1200,
        costValue: 6000000,
        profit: 3225000,
        profitPercent: 53.75,
        account: 'DEMO888 (VPS)',
        sourceFile: 'Lailodathuchien (14).xls'
      }
    ],
    cashTxns: [
      {
        id: 'acc1_c1',
        date: '01/08/2026',
        timestamp: new Date('2026-08-01').getTime(),
        type: 'DEPOSIT',
        amount: 100000000,
        note: 'Nạp tiền đầu tư ban đầu',
        sourceFile: 'SaoKeTien_VPS.xlsx'
      }
    ],
    holdings: [
      {
        id: 'acc1_h1',
        ticker: 'HPG',
        assetType: 'STOCK',
        volume: 2000,
        avgCostPrice: 26500,
        currentPrice: 28800,
        totalCostValue: 53000000,
        currentMarketValue: 57600000,
        unrealizedProfit: 4600000,
        unrealizedProfitPercent: 8.679
      }
    ],
    fileInfos: [
      {
        fileName: 'Lailodathuchien (14).xls',
        account: 'DEMO888 (VPS)',
        nameOwner: 'Tài Khoản Mẫu',
        fromDate: '01/08/2026',
        toDate: '20/09/2026',
        tradeCount: 3,
        totalProfit: 7057000
      }
    ]
  }
};

export function getInitialState(): MultiAccountState {
  return {
    accounts: JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS))
  };
}
