export type PaymentStatus = 'captured' | 'authorized' | 'failed' | 'refunded' | 'created';
export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet' | 'emi';
export type RazorpayMode = 'test' | 'live';

export interface Payment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  order_id: string;
  invoice_id: string | null;
  international: boolean;
  method: PaymentMethod;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  customer_id: string | null;
  notes: Record<string, string>;
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  acquirer_data: {
    bank_transaction_id?: string;
    auth_code?: string;
    rrn?: string;
  };
  created_at: number;
  mode: RazorpayMode;
}

export interface PaymentFilters {
  status?: PaymentStatus | 'all';
  mode?: RazorpayMode | 'all';
  startDate?: string;
  endDate?: string;
  method?: PaymentMethod | 'all';
}

export interface PaymentsResponse {
  entity: string;
  count: number;
  items: Payment[];
}

export interface DashboardStats {
  totalUsers: number;
  totalOrganizations: number;
  totalRevenue: number;
  pendingPayments: number;
  successfulPayments: number;
  failedPayments: number;
  razorpayMode: RazorpayMode;
}

export interface RevenueData {
  date: string;
  amount: number;
}

export interface PaymentMethodStats {
  method: PaymentMethod;
  count: number;
  amount: number;
}
