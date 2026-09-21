import { MultiAccountState, AccountData, TradeRecord, CashTransaction, OpenPosition } from '../types/stock';

export const ADMIN_PIN = '8888';

export const DEFAULT_ACCOUNTS: Record<'ACCOUNT_1' | 'ACCOUNT_2' | 'ACCOUNT_3', AccountData> = {
  ACCOUNT_1: {
    key: 'ACCOUNT_1',
    name: 'Tài Khoản 1 (Của Tôi)',
    ownerName: 'Nguyễn Văn A',
    accountNumber: 'LL22366 (VPS)',
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
        account: 'LL22366 (VPS)',
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
        account: 'LL22366 (VPS)',
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
        account: 'LL22366 (VPS)',
        sourceFile: 'Lailodathuchien (14).xls'
      },
      {
        id: 'acc1_t4',
        date: '20/09/2026 11:20:00',
        timestamp: new Date('2026-09-20T11:20:00').getTime(),
        dateFormatted: '2026-09-20',
        ticker: 'CACB2510',
        assetType: 'WARRANT',
        sellVolume: 10000,
        sellPrice: 950,
        feeAndTax: 30000,
        sellValue: 9500000,
        costPrice: 1100,
        costValue: 11000000,
        profit: -1530000,
        profitPercent: -13.909,
        account: 'LL22366 (VPS)',
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
      },
      {
        id: 'acc1_c2',
        date: '15/08/2026',
        timestamp: new Date('2026-08-15').getTime(),
        type: 'DEPOSIT',
        amount: 50000000,
        note: 'Nạp thêm vốn đợt 2',
        sourceFile: 'SaoKeTien_VPS.xlsx'
      },
      {
        id: 'acc1_c3',
        date: '01/09/2026',
        timestamp: new Date('2026-09-01').getTime(),
        type: 'WITHDRAWAL',
        amount: 20000000,
        note: 'Rút lợi nhuận',
        sourceFile: 'SaoKeTien_VPS.xlsx'
      },
      {
        id: 'acc1_c4',
        date: '10/09/2026',
        timestamp: new Date('2026-09-10').getTime(),
        type: 'MARGIN_INTEREST',
        amount: 350000,
        note: 'Lãi vay margin tháng 8',
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
      },
      {
        id: 'acc1_h2',
        ticker: 'FPT',
        assetType: 'STOCK',
        volume: 500,
        avgCostPrice: 125000,
        currentPrice: 138000,
        totalCostValue: 62500000,
        currentMarketValue: 69000000,
        unrealizedProfit: 6500000,
        unrealizedProfitPercent: 10.4
      },
      {
        id: 'acc1_h3',
        ticker: 'CHPG2607',
        assetType: 'WARRANT',
        volume: 5000,
        avgCostPrice: 1500,
        currentPrice: 1820,
        totalCostValue: 7500000,
        currentMarketValue: 9100000,
        unrealizedProfit: 1600000,
        unrealizedProfitPercent: 21.333
      }
    ],
    fileInfos: [
      {
        fileName: 'Lailodathuchien (14).xls',
        account: 'LL22366 (VPS)',
        nameOwner: 'Nguyễn Văn A',
        fromDate: '01/08/2026',
        toDate: '20/09/2026',
        tradeCount: 4,
        totalProfit: 5527000
      }
    ]
  },

  ACCOUNT_2: {
    key: 'ACCOUNT_2',
    name: 'Tài Khoản 2 (Bạn A)',
    ownerName: 'Trần Thị B',
    accountNumber: '889012 (DNSE)',
    broker: 'DNSE',
    pin: '2222',
    trades: [
      {
        id: 'acc2_t1',
        date: '10/09/2026 11:03:38',
        timestamp: new Date('2026-09-10T11:03:38').getTime(),
        dateFormatted: '2026-09-10',
        ticker: 'MBB',
        assetType: 'STOCK',
        sellVolume: 2000,
        sellPrice: 24500,
        feeAndTax: 98000,
        sellValue: 49000000,
        costPrice: 22000,
        costValue: 44000000,
        profit: 4902000,
        profitPercent: 11.14,
        account: '889012 (DNSE)',
        sourceFile: 'KH - LS lãi lỗ (21).xlsx'
      },
      {
        id: 'acc2_t2',
        date: '14/09/2026 13:25:49',
        timestamp: new Date('2026-09-14T13:25:49').getTime(),
        dateFormatted: '2026-09-14',
        ticker: 'SSI',
        assetType: 'STOCK',
        sellVolume: 1500,
        sellPrice: 34000,
        feeAndTax: 102000,
        sellValue: 51000000,
        costPrice: 36000,
        costValue: 54000000,
        profit: -3102000,
        profitPercent: -5.744,
        account: '889012 (DNSE)',
        sourceFile: 'KH - LS lãi lỗ (21).xlsx'
      },
      {
        id: 'acc2_t3',
        date: '19/09/2026 09:30:00',
        timestamp: new Date('2026-09-19T09:30:00').getTime(),
        dateFormatted: '2026-09-19',
        ticker: 'CMBB2505',
        assetType: 'WARRANT',
        sellVolume: 8000,
        sellPrice: 1400,
        feeAndTax: 33600,
        sellValue: 11200000,
        costPrice: 900,
        costValue: 7200000,
        profit: 3966400,
        profitPercent: 55.088,
        account: '889012 (DNSE)',
        sourceFile: 'KH - LS lãi lỗ (21).xlsx'
      }
    ],
    cashTxns: [
      {
        id: 'acc2_c1',
        date: '05/08/2026',
        timestamp: new Date('2026-08-05').getTime(),
        type: 'DEPOSIT',
        amount: 120000000,
        note: 'Nạp vốn nạp ban đầu Entrade X',
        sourceFile: 'EntradeX_Statement.xlsx'
      }
    ],
    holdings: [
      {
        id: 'acc2_h1',
        ticker: 'TCB',
        assetType: 'STOCK',
        volume: 3000,
        avgCostPrice: 23500,
        currentPrice: 25200,
        totalCostValue: 70500000,
        currentMarketValue: 75600000,
        unrealizedProfit: 5100000,
        unrealizedProfitPercent: 7.234
      },
      {
        id: 'acc2_h2',
        ticker: 'CMWW2502',
        assetType: 'WARRANT',
        volume: 4000,
        avgCostPrice: 2100,
        currentPrice: 2450,
        totalCostValue: 8400000,
        currentMarketValue: 9800000,
        unrealizedProfit: 1400000,
        unrealizedProfitPercent: 16.667
      }
    ],
    fileInfos: [
      {
        fileName: 'KH - LS lãi lỗ (21).xlsx',
        account: '889012 (DNSE)',
        nameOwner: 'Trần Thị B',
        fromDate: '01/08/2026',
        toDate: '20/09/2026',
        tradeCount: 3,
        totalProfit: 5766400
      }
    ]
  },

  ACCOUNT_3: {
    key: 'ACCOUNT_3',
    name: 'Tài Khoản 3 (Bạn B)',
    ownerName: 'Lê Văn C',
    accountNumber: '105C778 (TCBS)',
    broker: 'TCBS',
    pin: '3333',
    trades: [
      {
        id: 'acc3_t1',
        date: '12/09/2026 14:10:00',
        timestamp: new Date('2026-09-12T14:10:00').getTime(),
        dateFormatted: '2026-09-12',
        ticker: 'MWG',
        assetType: 'STOCK',
        sellVolume: 1000,
        sellPrice: 68000,
        feeAndTax: 136000,
        sellValue: 68000000,
        costPrice: 62000,
        costValue: 62000000,
        profit: 5864000,
        profitPercent: 9.458,
        account: '105C778 (TCBS)',
        sourceFile: 'TCBS_Realized_PL.xlsx'
      },
      {
        id: 'acc3_t2',
        date: '17/09/2026 10:45:00',
        timestamp: new Date('2026-09-17T10:45:00').getTime(),
        dateFormatted: '2026-09-17',
        ticker: 'VCB',
        assetType: 'STOCK',
        sellVolume: 500,
        sellPrice: 91000,
        feeAndTax: 91000,
        sellValue: 45500000,
        costPrice: 88000,
        costValue: 44000000,
        profit: 1409000,
        profitPercent: 3.202,
        account: '105C778 (TCBS)',
        sourceFile: 'TCBS_Realized_PL.xlsx'
      }
    ],
    cashTxns: [
      {
        id: 'acc3_c1',
        date: '10/08/2026',
        timestamp: new Date('2026-08-10').getTime(),
        type: 'DEPOSIT',
        amount: 150000000,
        note: 'Nạp vốn TCBS iWealth',
        sourceFile: 'TCBS_Cashflow.xlsx'
      },
      {
        id: 'acc3_c2',
        date: '02/09/2026',
        timestamp: new Date('2026-09-02').getTime(),
        type: 'WITHDRAWAL',
        amount: 30000000,
        note: 'Rút tiền mua sắm',
        sourceFile: 'TCBS_Cashflow.xlsx'
      }
    ],
    holdings: [
      {
        id: 'acc3_h1',
        ticker: 'VHM',
        assetType: 'STOCK',
        volume: 1500,
        avgCostPrice: 42000,
        currentPrice: 45500,
        totalCostValue: 63000000,
        currentMarketValue: 68250000,
        unrealizedProfit: 5250000,
        unrealizedProfitPercent: 8.333
      },
      {
        id: 'acc3_h2',
        ticker: 'MSN',
        assetType: 'STOCK',
        volume: 1000,
        avgCostPrice: 75000,
        currentPrice: 78200,
        totalCostValue: 75000000,
        currentMarketValue: 78200000,
        unrealizedProfit: 3200000,
        unrealizedProfitPercent: 4.267
      }
    ],
    fileInfos: [
      {
        fileName: 'TCBS_Realized_PL.xlsx',
        account: '105C778 (TCBS)',
        nameOwner: 'Lê Văn C',
        fromDate: '01/08/2026',
        toDate: '20/09/2026',
        tradeCount: 2,
        totalProfit: 7273000
      }
    ]
  }
};

export function getInitialState(): MultiAccountState {
  return {
    accounts: JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS))
  };
}
