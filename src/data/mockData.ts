import type { Payment, DashboardStats, RevenueData, RazorpayMode } from '../types';

const generatePaymentId = () => `pay_${Math.random().toString(36).substring(2, 15)}`;
const generateOrderId = () => `order_${Math.random().toString(36).substring(2, 15)}`;

const methods = ['card', 'upi', 'netbanking', 'wallet'] as const;
const statuses = ['captured', 'failed', 'created', 'authorized'] as const;

export const generateMockPayments = (count: number = 50): Payment[] => {
  const now = Date.now();
  const payments: Payment[] = [];

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const amount = Math.floor(Math.random() * 50000) * 100 + 10000; // 100 to 50000 INR in paise
    const createdAt = Math.floor((now - Math.random() * 30 * 24 * 60 * 60 * 1000) / 1000);

    payments.push({
      id: generatePaymentId(),
      entity: 'payment',
      amount,
      currency: 'INR',
      status,
      order_id: generateOrderId(),
      invoice_id: null,
      international: false,
      method,
      amount_refunded: 0,
      refund_status: null,
      captured: status === 'captured',
      description: `Payment for VDR Plan - ${['Basic', 'Pro', 'Enterprise'][Math.floor(Math.random() * 3)]}`,
      card_id: method === 'card' ? `card_${Math.random().toString(36).substring(2, 10)}` : null,
      bank: method === 'netbanking' ? ['HDFC', 'ICICI', 'SBI', 'Axis'][Math.floor(Math.random() * 4)] : null,
      wallet: method === 'wallet' ? ['paytm', 'phonepe', 'freecharge'][Math.floor(Math.random() * 3)] : null,
      vpa: method === 'upi' ? `user${i}@upi` : null,
      email: `user${i + 1}@example.com`,
      contact: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      customer_id: `cust_${Math.random().toString(36).substring(2, 10)}`,
      notes: {
        organization: `Org ${Math.floor(Math.random() * 20) + 1}`,
        plan: ['Basic', 'Pro', 'Enterprise'][Math.floor(Math.random() * 3)],
      },
      fee: Math.floor(amount * 0.02),
      tax: Math.floor(amount * 0.02 * 0.18),
      error_code: status === 'failed' ? 'BAD_REQUEST_ERROR' : null,
      error_description: status === 'failed' ? 'Payment failed due to insufficient funds' : null,
      error_source: status === 'failed' ? 'bank' : null,
      error_step: status === 'failed' ? 'payment_authorization' : null,
      error_reason: status === 'failed' ? 'insufficient_funds' : null,
      acquirer_data: {
        bank_transaction_id: method === 'netbanking' ? `txn_${Math.random().toString(36).substring(2, 15)}` : undefined,
        rrn: method === 'upi' ? Math.floor(Math.random() * 1000000000000).toString() : undefined,
      },
      created_at: createdAt,
      mode: 'test' as RazorpayMode,
    });
  }

  return payments.sort((a, b) => b.created_at - a.created_at);
};

export const mockPayments = generateMockPayments(50);

export const mockDashboardStats: DashboardStats = {
  totalUsers: 1247,
  totalOrganizations: 86,
  totalRevenue: mockPayments
    .filter((p) => p.status === 'captured')
    .reduce((sum, p) => sum + p.amount, 0),
  pendingPayments: mockPayments
    .filter((p) => p.status === 'created' || p.status === 'authorized')
    .reduce((sum, p) => sum + p.amount, 0),
  successfulPayments: mockPayments.filter((p) => p.status === 'captured').length,
  failedPayments: mockPayments.filter((p) => p.status === 'failed').length,
  razorpayMode: 'test',
};

export const generateRevenueData = (period: 'daily' | 'monthly'): RevenueData[] => {
  const data: RevenueData[] = [];
  const now = new Date();

  if (period === 'daily') {
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 500000) + 100000,
      });
    }
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (now.getMonth() - i + 12) % 12;
      data.push({
        date: months[monthIndex],
        amount: Math.floor(Math.random() * 5000000) + 1000000,
      });
    }
  }

  return data;
};

export const mockRevenueDaily = generateRevenueData('daily');
export const mockRevenueMonthly = generateRevenueData('monthly');
