import { useState, useEffect } from 'react';
import { Card, CardHeader, Select } from '../../components/common';
import { StatsCard, RazorpayModeIndicator } from '../../components/dashboard';
import { LineChart, DoughnutChart, BarChart } from '../../components/charts';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { paymentsApi } from '../../api';
import type { DashboardStats, RevenueData, Payment } from '../../types';
import { PAYMENT_METHOD_LABELS } from '../../utils/constants';

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [revenuePeriod, setRevenuePeriod] = useState<'daily' | 'monthly'>('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [statsData, paymentsData] = await Promise.all([
          paymentsApi.getDashboardStats(),
          paymentsApi.getPayments({ count: 100 }),
        ]);
        setStats(statsData);
        setPayments(paymentsData.items || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const data = await paymentsApi.getRevenueData(revenuePeriod);
        setRevenueData(data);
      } catch (err) {
        console.error('Failed to fetch revenue data:', err);
      }
    };

    if (stats) {
      fetchRevenueData();
    }
  }, [revenuePeriod, stats]);

  // Calculate payment status distribution from payments
  const paymentStatusData = {
    success: payments.filter((p) => p.status === 'captured').length,
    failed: payments.filter((p) => p.status === 'failed').length,
    pending: payments.filter((p) => p.status === 'created' || p.status === 'authorized').length,
  };

  // Calculate payment method distribution
  const paymentMethodData = Object.entries(
    payments.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([method, count]) => ({
    method,
    label: PAYMENT_METHOD_LABELS[method] || method,
    count,
  }));

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 dark:text-red-400 mb-4">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Overview of your VDR platform performance
          </p>
        </div>
        <RazorpayModeIndicator mode={stats.razorpayMode} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconBgColor="bg-green-100 dark:bg-green-900/30"
        />

        <StatsCard
          title="Pending Amount"
          value={formatCurrency(stats.pendingPayments)}
          icon={
            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconBgColor="bg-yellow-100 dark:bg-yellow-900/30"
        />

        <StatsCard
          title="Successful Payments"
          value={formatNumber(stats.successfulPayments)}
          icon={
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
        />

        <StatsCard
          title="Failed Payments"
          value={formatNumber(stats.failedPayments)}
          icon={
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconBgColor="bg-red-100 dark:bg-red-900/30"
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          title="Total Users"
          value={formatNumber(stats.totalUsers)}
          icon={
            <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />

        <StatsCard
          title="Total Organizations"
          value={formatNumber(stats.totalOrganizations)}
          icon={
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <Card className="lg:col-span-2" padding="lg">
          <CardHeader
            title="Revenue Trend"
            subtitle={`${revenuePeriod === 'daily' ? 'Last 30 days' : 'Last 12 months'}`}
            action={
              <Select
                value={revenuePeriod}
                onChange={(e) => setRevenuePeriod(e.target.value as 'daily' | 'monthly')}
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'monthly', label: 'Monthly' },
                ]}
                className="w-32"
              />
            }
          />
          {revenueData.length > 0 ? (
            <LineChart
              labels={revenueData.map((d) => d.date)}
              datasets={[
                {
                  label: 'Revenue',
                  data: revenueData.map((d) => d.amount / 100),
                },
              ]}
              height={300}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No revenue data available
            </div>
          )}
        </Card>

        {/* Payment Status Distribution */}
        <Card padding="lg">
          <CardHeader title="Payment Status" subtitle="Distribution of payments" />
          {payments.length > 0 ? (
            <DoughnutChart
              labels={['Success', 'Failed', 'Pending']}
              data={[paymentStatusData.success, paymentStatusData.failed, paymentStatusData.pending]}
              colors={['#22c55e', '#ef4444', '#f59e0b']}
              height={260}
            />
          ) : (
            <div className="h-[260px] flex items-center justify-center text-gray-500">
              No payment data available
            </div>
          )}
        </Card>
      </div>

      {/* Payment Methods Chart */}
      <Card padding="lg">
        <CardHeader title="Payment Methods" subtitle="Breakdown by payment method" />
        {paymentMethodData.length > 0 ? (
          <BarChart
            labels={paymentMethodData.map((d) => d.label)}
            datasets={[
              {
                label: 'Transactions',
                data: paymentMethodData.map((d) => d.count),
                backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b'],
              },
            ]}
            height={250}
          />
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-500">
            No payment method data available
          </div>
        )}
      </Card>
    </div>
  );
};
