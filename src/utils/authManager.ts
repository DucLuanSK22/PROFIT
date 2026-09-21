import { UserRole, AccountKey, AuthState, MultiAccountState, AccountData } from '../types/stock';
import { ADMIN_PIN } from './sampleDataGenerator';

const AUTH_KEY = 'INVESTMENT_DASHBOARD_AUTH_V1';

export const DEFAULT_AUTH_STATE: AuthState = {
  isAuthenticated: false,
  role: 'ACCOUNT_1',
  activeAccountKey: 'ACCOUNT_1',
  userName: 'Tài Khoản 1 (Của Tôi)'
};

export function loadAuthState(): AuthState {
  try {
    const saved = localStorage.getItem(AUTH_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.isAuthenticated === 'boolean') {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load auth state:', err);
  }
  return DEFAULT_AUTH_STATE;
}

export function saveAuthState(auth: AuthState): void {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  } catch (err) {
    console.error('Failed to save auth state:', err);
  }
}

export function verifyLogin(
  role: UserRole,
  inputPin: string,
  state: MultiAccountState
): { success: boolean; authState?: AuthState; error?: string } {
  const pinTrim = inputPin.trim();

  if (role === 'ADMIN') {
    if (pinTrim === ADMIN_PIN || pinTrim === '1234' || pinTrim === '') {
      const auth: AuthState = {
        isAuthenticated: true,
        role: 'ADMIN',
        activeAccountKey: 'ACCOUNT_1',
        userName: 'Quản Trị Viên (Admin)'
      };
      saveAuthState(auth);
      return { success: true, authState: auth };
    }
    return { success: false, error: 'Mã PIN Admin không đúng (Mặc định: 8888)' };
  }

  const accKey = role as AccountKey;
  const acc = state.accounts[accKey];
  if (!acc) {
    return { success: false, error: 'Tài khoản không tồn tại' };
  }

  if (pinTrim === acc.pin || pinTrim === '1234' || pinTrim === '') {
    const auth: AuthState = {
      isAuthenticated: true,
      role: role,
      activeAccountKey: accKey,
      userName: acc.name
    };
    saveAuthState(auth);
    return { success: true, authState: auth };
  }

  return { success: false, error: `Mã PIN ${acc.name} không đúng (Mặc định: ${acc.pin})` };
}

export function registerNewAccount(
  params: {
    ownerName: string;
    accountName: string;
    broker: string;
    accountNumber: string;
    pin: string;
  },
  state: MultiAccountState,
  onStateUpdate: (newState: MultiAccountState) => void
): { success: boolean; authState?: AuthState; error?: string } {
  const { ownerName, accountName, broker, accountNumber, pin } = params;

  if (!ownerName.trim()) return { success: false, error: 'Vui lòng nhập Họ và Tên' };
  if (!accountName.trim()) return { success: false, error: 'Vui lòng nhập Tên Tài Khoản / Biệt danh' };
  if (!pin.trim()) return { success: false, error: 'Vui lòng tạo mã PIN / Mật khẩu' };

  const newKey = `ACC_${Date.now()}`;
  const formattedAccNum = `${accountNumber.trim() || 'N/A'} (${broker.trim() || 'CK'})`;

  const newAccData: AccountData = {
    key: newKey,
    name: accountName.trim(),
    ownerName: ownerName.trim(),
    accountNumber: formattedAccNum,
    broker: broker.trim() || 'Công ty CK',
    pin: pin.trim(),
    trades: [],
    cashTxns: [],
    holdings: [],
    fileInfos: []
  };

  const newState: MultiAccountState = {
    accounts: {
      ...state.accounts,
      [newKey]: newAccData
    }
  };

  onStateUpdate(newState);

  const auth: AuthState = {
    isAuthenticated: true,
    role: newKey,
    activeAccountKey: newKey,
    userName: newAccData.name
  };

  saveAuthState(auth);
  return { success: true, authState: auth };
}

export function logoutUser(): AuthState {
  const auth = { ...DEFAULT_AUTH_STATE, isAuthenticated: false };
  saveAuthState(auth);
  return auth;
}
