import React, { useState, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { AuthState, UserRole, AccountKey, ActiveModule, MultiAccountState, CashTransaction, OpenPosition, AccountData } from './types/stock';
import { loadAuthState, saveAuthState, logoutUser } from './utils/authManager';
import { loadMultiAccountState, saveMultiAccountState, resetToSampleData } from './utils/storageManager';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { Dropzone } from './components/Dropzone';
import { SummaryCards } from './components/SummaryCards';
import { ChartsDashboard } from './components/ChartsDashboard';
import { TradeTable } from './components/TradeTable';
import { UploadedFilesList } from './components/UploadedFilesList';
import { CashflowModule } from './components/CashflowModule';
import { HoldingsModule } from './components/HoldingsModule';
import { GroupComparisonModule } from './components/GroupComparisonModule';
import { parseExcelFile, mergeTrades, calculateSummaryStats, getTickerSummaries, parseHtmlXls, parseWorkbookXlsx, ParseFileResult } from './utils/excelParser';
import { ShieldCheck, RotateCcw, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleResetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-panel bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">Đã Xảy Ra Lỗi Hiển Thị</h2>
              <p className="text-xs text-slate-400">
                Ứng dụng gặp sự cố đọc dữ liệu đã lưu. Bấm nút bên dưới để khôi phục dữ liệu ban đầu.
              </p>
            </div>
            <button
              onClick={this.handleResetData}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/20 cursor-pointer flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Khôi Phục Dữ Liệu Ban Đầu</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  // Auth state
  const [authState, setAuthState] = useState<AuthState>(() => loadAuthState());

  // Multi-Account state
  const [multiAccountState, setMultiAccountState] = useState<MultiAccountState>(() => loadMultiAccountState());

  // Active view module
  const [activeModule, setActiveModule] = useState<ActiveModule>('REALIZED_PNL');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Helper to update & persist multi-account state
  const updateMultiAccountState = (newState: MultiAccountState) => {
    setMultiAccountState(newState);
    saveMultiAccountState(newState);
  };

  const handleLoginSuccess = (newAuth: AuthState) => {
    setAuthState(newAuth);
    if (newAuth.role === 'ADMIN') {
      setActiveModule('GROUP_SUMMARY');
    } else {
      setActiveModule('REALIZED_PNL');
    }
  };

  const handleLogout = () => {
    const freshAuth = logoutUser();
    setAuthState(freshAuth);
  };

  const activeAccountKey = authState?.activeAccountKey || 'ACCOUNT_1';
  const currentAccountData = (multiAccountState?.accounts && multiAccountState.accounts[activeAccountKey])
    ? multiAccountState.accounts[activeAccountKey]
    : (multiAccountState?.accounts && multiAccountState.accounts.ACCOUNT_1)
    ? multiAccountState.accounts.ACCOUNT_1
    : {
        key: 'ACCOUNT_1',
        name: 'Tài Khoản 1 (Của Tôi)',
        ownerName: 'Nguyễn Văn A',
        accountNumber: 'LL22366 (VPS)',
        broker: 'VPS',
        pin: '1234',
        trades: [],
        cashTxns: [],
        holdings: [],
        fileInfos: []
      };

  // File Upload Logic: Parses dropped files and merges into current active account
  const handleFilesDropped = async (files: File[]) => {
    setIsLoading(true);
    try {
      const parsedList: ParseFileResult[] = [];
      for (const file of files) {
        try {
          const res = await parseExcelFile(file);
          if (res.trades.length > 0) {
            parsedList.push(res);
          }
        } catch (err) {
          console.error(`Lỗi khi đọc file ${file.name}:`, err);
        }
      }

      if (parsedList.length > 0) {
        const existingTrades = currentAccountData.trades || [];
        const existingFileInfos = currentAccountData.fileInfos || [];
        
        // Wrap existing + new into parse result structure for mergeTrades
        const allParsedInput: ParseFileResult[] = [
          {
            fileInfo: {
              fileName: 'Dữ liệu hiện tại',
              account: currentAccountData.accountNumber,
              nameOwner: currentAccountData.ownerName,
              fromDate: '',
              toDate: '',
              tradeCount: existingTrades.length,
              totalProfit: existingTrades.reduce((s, t) => s + t.profit, 0)
            },
            trades: existingTrades
          },
          ...parsedList
        ];

        const { mergedTrades } = mergeTrades(allParsedInput);
        const newFileInfos = [...existingFileInfos, ...parsedList.map(p => p.fileInfo)];

        const updatedAccount: AccountData = {
          ...currentAccountData,
          trades: mergedTrades,
          fileInfos: newFileInfos
        };

        const newState: MultiAccountState = {
          accounts: {
            ...multiAccountState.accounts,
            [activeAccountKey]: updatedAccount
          }
        };

        updateMultiAccountState(newState);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sample files loader
  const sampleFilesList = [
    'Lailodathuchien (9).xls',
    'Lailodathuchien (10).xls',
    'Lailodathuchien (11).xls',
    'Lailodathuchien (12).xls',
    'Lailodathuchien (13).xls',
    'Lailodathuchien (14).xls'
  ];

  const handleLoadSampleData = async () => {
    setIsLoading(true);
    try {
      const results: ParseFileResult[] = [];
      for (const fileName of sampleFilesList) {
        try {
          const baseUrl = (import.meta as any).env?.BASE_URL || '/';
          const res = await fetch(`${baseUrl}${encodeURIComponent(fileName)}`);
          if (res.ok) {
            const htmlText = await res.text();
            const parseRes = parseHtmlXls(htmlText, fileName);
            if (parseRes.trades.length > 0) results.push(parseRes);
          }
        } catch (e) {
          console.warn('Could not fetch sample file:', fileName, e);
        }
      }

      if (results.length > 0) {
        const { mergedTrades } = mergeTrades(results);
        const updatedAccount: AccountData = {
          ...currentAccountData,
          trades: mergedTrades,
          fileInfos: results.map(r => r.fileInfo)
        };
        const newState: MultiAccountState = {
          accounts: {
            ...multiAccountState.accounts,
            [activeAccountKey]: updatedAccount
          }
        };
        updateMultiAccountState(newState);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    const updatedFileInfos = (currentAccountData.fileInfos || []).filter(f => f.fileName !== fileName);
    const updatedTrades = (currentAccountData.trades || []).filter(t => t.sourceFile !== fileName);

    const updatedAccount: AccountData = {
      ...currentAccountData,
      trades: updatedTrades,
      fileInfos: updatedFileInfos
    };

    const newState: MultiAccountState = {
      accounts: {
        ...multiAccountState.accounts,
        [activeAccountKey]: updatedAccount
      }
    };
    updateMultiAccountState(newState);
  };

  // Cash transaction handler
  const handleAddCashTxn = (newTxn: CashTransaction) => {
    const updatedCashTxns = [newTxn, ...(currentAccountData.cashTxns || [])];
    const updatedAccount: AccountData = {
      ...currentAccountData,
      cashTxns: updatedCashTxns
    };
    const newState: MultiAccountState = {
      accounts: {
        ...multiAccountState.accounts,
        [activeAccountKey]: updatedAccount
      }
    };
    updateMultiAccountState(newState);
  };

  // Open holdings handler
  const handleUpdateHoldings = (newHoldings: OpenPosition[]) => {
    const updatedAccount: AccountData = {
      ...currentAccountData,
      holdings: newHoldings
    };
    const newState: MultiAccountState = {
      accounts: {
        ...multiAccountState.accounts,
        [activeAccountKey]: updatedAccount
      }
    };
    updateMultiAccountState(newState);
  };

  // Compute stats for current account trades
  const trades = currentAccountData.trades || [];
  const fileInfos = currentAccountData.fileInfos || [];

  const stats = useMemo(() => calculateSummaryStats(trades), [trades]);
  const tickerSummaries = useMemo(() => getTickerSummaries(trades), [trades]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-blue-500 selection:text-white w-full">
      {/* Login Modal Overlay if not authenticated */}
      {!authState?.isAuthenticated && (
        <LoginModal
          state={multiAccountState}
          onLoginSuccess={handleLoginSuccess}
          onStateUpdate={updateMultiAccountState}
        />
      )}

      {/* Header with Role Scoping & Account Switcher */}
      <Header
        authState={authState}
        state={multiAccountState}
        activeModule={activeModule}
        onSelectAccount={(key: AccountKey) => {
          setAuthState(prev => ({ ...prev, activeAccountKey: key }));
        }}
        onSelectModule={setActiveModule}
        onLogout={handleLogout}
        onStateChange={updateMultiAccountState}
      />

      {/* Main App Container */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-8 space-y-8">
        
        {/* VIEW 1: ADMIN GROUP SUMMARY MODULE */}
        {activeModule === 'GROUP_SUMMARY' && authState?.role === 'ADMIN' && (
          <GroupComparisonModule state={multiAccountState} />
        )}

        {/* VIEW 2: MODULE 1 - REALIZED P&L DASHBOARD */}
        {activeModule === 'REALIZED_PNL' && (
          <div className="space-y-8 w-full">
            {/* File Upload Zone */}
            <Dropzone
              onFilesDropped={handleFilesDropped}
              onLoadSampleData={handleLoadSampleData}
              uploadedFiles={fileInfos}
              duplicateCount={0}
              isLoading={isLoading}
            />

            {/* Uploaded Files List */}
            {fileInfos.length > 0 && (
              <UploadedFilesList files={fileInfos} onRemoveFile={handleRemoveFile} />
            )}

            {/* Realized P&L Stats & Charts */}
            {trades.length > 0 && (
              <div className="space-y-8 animate-fadeIn w-full">
                <SummaryCards stats={stats} />
                <ChartsDashboard
                  trades={trades}
                  tickerSummaries={tickerSummaries}
                  stats={stats}
                />
                <TradeTable
                  trades={trades}
                  accounts={[currentAccountData.accountNumber]}
                />
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: MODULE 2 - CASH TRANSACTIONS (DEPOSIT & WITHDRAWAL) */}
        {activeModule === 'CASHFLOW' && (
          <CashflowModule
            accountData={currentAccountData}
            onAddTransaction={handleAddCashTxn}
          />
        )}

        {/* VIEW 4: MODULE 3 - OPEN HOLDINGS PORTFOLIO */}
        {activeModule === 'HOLDINGS' && (
          <HoldingsModule
            accountData={currentAccountData}
            onUpdateHoldings={handleUpdateHoldings}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 bg-slate-950 text-center text-xs text-slate-500 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Đa Tài Khoản & Phân Quyền Bảo Mật 100% Client-Side</span>
          </div>
          <div>
            Tài Khoản 1 (Tôi) • Tài Khoản 2 (Bạn A) • Tài Khoản 3 (Bạn B)
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);

export default App;
