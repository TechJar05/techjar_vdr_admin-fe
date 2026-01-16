import type { Payment } from '../types';
import { formatCurrency, formatDateTime } from './formatters';
import { PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from './constants';

export const exportPaymentsToCSV = (payments: Payment[], filename: string = 'payments'): void => {
  const headers = [
    'Payment ID',
    'Order ID',
    'Amount',
    'Currency',
    'Status',
    'Method',
    'Email',
    'Contact',
    'Date',
    'Mode',
  ];

  const rows = payments.map((payment) => [
    payment.id,
    payment.order_id,
    formatCurrency(payment.amount, payment.currency),
    payment.currency,
    PAYMENT_STATUS_LABELS[payment.status] || payment.status,
    PAYMENT_METHOD_LABELS[payment.method] || payment.method,
    payment.email,
    payment.contact,
    formatDateTime(payment.created_at),
    payment.mode.toUpperCase(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
