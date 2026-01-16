import { format, formatDistanceToNow } from 'date-fns';

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount / 100); // Razorpay amounts are in paise
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

export const formatDate = (date: Date | number | string, formatStr: string = 'dd MMM yyyy'): string => {
  const dateObj = typeof date === 'number' ? new Date(date * 1000) : new Date(date);
  return format(dateObj, formatStr);
};

export const formatDateTime = (date: Date | number | string): string => {
  const dateObj = typeof date === 'number' ? new Date(date * 1000) : new Date(date);
  return format(dateObj, 'dd MMM yyyy, hh:mm a');
};

export const formatRelativeTime = (date: Date | number | string): string => {
  const dateObj = typeof date === 'number' ? new Date(date * 1000) : new Date(date);
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const truncateString = (str: string, maxLength: number = 20): string => {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};

export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return email;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
};

export const maskPhone = (phone: string): string => {
  if (phone.length <= 4) return phone;
  return `****${phone.slice(-4)}`;
};
