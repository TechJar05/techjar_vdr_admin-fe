import axios from './axios';
import type { Payment, PaymentsResponse, PaymentFilters, DashboardStats, RevenueData } from '../types';

export const paymentsApi = {
  getPayments: async (filters?: PaymentFilters & { skip?: number; count?: number }): Promise<PaymentsResponse> => {
    const params = new URLSearchParams();

    if (filters?.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters?.count !== undefined) params.append('count', filters.count.toString());
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.startDate) params.append('from', Math.floor(new Date(filters.startDate).getTime() / 1000).toString());
    if (filters?.endDate) params.append('to', Math.floor(new Date(filters.endDate).getTime() / 1000).toString());

    const response = await axios.get<PaymentsResponse>(`/superadmin/payments?${params.toString()}`);
    return response.data;
  },

  getPaymentById: async (paymentId: string): Promise<Payment> => {
    const response = await axios.get<Payment>(`/superadmin/payments/${paymentId}`);
    return response.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await axios.get<DashboardStats>('/superadmin/dashboard/stats');
    return response.data;
  },

  getRevenueData: async (period: 'daily' | 'monthly' = 'daily'): Promise<RevenueData[]> => {
    const response = await axios.get<RevenueData[]>(`/superadmin/dashboard/revenue?period=${period}`);
    return response.data;
  },

  refundPayment: async (paymentId: string, amount?: number): Promise<Payment> => {
    const response = await axios.post<Payment>(`/superadmin/payments/${paymentId}/refund`, { amount });
    return response.data;
  },
};
