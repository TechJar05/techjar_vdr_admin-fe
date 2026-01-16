export const API_URL = import.meta.env.VITE_API_URL || 'https://vdr.tjdem.online/api';
export const RAZORPAY_MODE = import.meta.env.VITE_RAZORPAY_MODE || 'test';

export const STORAGE_KEYS = {
  TOKEN: 'vdr_admin_token',
  ADMIN: 'vdr_admin_user',
  THEME: 'vdr_admin_theme',
} as const;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  captured: 'Success',
  authorized: 'Authorized',
  failed: 'Failed',
  refunded: 'Refunded',
  created: 'Pending',
};

export const PAYMENT_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  captured: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  authorized: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  refunded: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  created: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: 'Card',
  upi: 'UPI',
  netbanking: 'Netbanking',
  wallet: 'Wallet',
  emi: 'EMI',
};

export const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: 'dashboard' },
  { name: 'Payments', path: '/payments', icon: 'payments' },
] as const;
