import { useState, useEffect, useMemo } from 'react';
import { Card, Table, Badge, Button, Select, Pagination, Modal, DateRangePicker } from '../../components/common';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS, PAYMENT_METHOD_LABELS } from '../../utils/constants';
import { paymentsApi } from '../../api';
import type { Payment, PaymentFilters, PaymentStatus, PaymentMethod, RazorpayMode } from '../../types';
import { exportPaymentsToCSV } from '../../utils/exportCSV';

const ITEMS_PER_PAGE = 10;

export const PaymentList = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [filters, setFilters] = useState<PaymentFilters>({
    status: 'all',
    mode: 'all',
    startDate: '',
    endDate: '',
    method: 'all',
  });

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await paymentsApi.getPayments({
          count: 100,
          status: filters.status !== 'all' ? filters.status : undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        });
        setPayments(response.items || []);
      } catch (err) {
        console.error('Failed to fetch payments:', err);
        setError('Failed to load payments. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [filters.status, filters.startDate, filters.endDate]);

  // Apply client-side filters for mode and method (Razorpay API doesn't support these directly)
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      if (filters.mode && filters.mode !== 'all' && payment.mode !== filters.mode) {
        return false;
      }
      if (filters.method && filters.method !== 'all' && payment.method !== filters.method) {
        return false;
      }
      return true;
    });
  }, [payments, filters.mode, filters.method]);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleExportCSV = () => {
    exportPaymentsToCSV(filteredPayments, 'vdr_payments');
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      mode: 'all',
      startDate: '',
      endDate: '',
      method: 'all',
    });
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const label = PAYMENT_STATUS_LABELS[status] || status;

    const variantMap: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
      captured: 'success',
      failed: 'error',
      created: 'warning',
      authorized: 'info',
      refunded: 'default',
    };

    return (
      <Badge variant={variantMap[status] || 'default'} dot>
        {label}
      </Badge>
    );
  };

  const getModeBadge = (mode: RazorpayMode) => {
    return (
      <Badge variant={mode === 'test' ? 'warning' : 'success'} size="sm">
        {mode.toUpperCase()}
      </Badge>
    );
  };

  const columns = [
    {
      key: 'id',
      header: 'Payment ID',
      render: (payment: Payment) => (
        <span className="font-mono text-sm">{payment.id.slice(0, 18)}...</span>
      ),
    },
    {
      key: 'order_id',
      header: 'Order ID',
      render: (payment: Payment) => (
        <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
          {payment.order_id ? `${payment.order_id.slice(0, 15)}...` : '-'}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Customer',
      render: (payment: Payment) => (
        <div>
          <p className="font-medium">{payment.email || '-'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{payment.contact || '-'}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (payment: Payment) => (
        <span className="font-semibold">{formatCurrency(payment.amount, payment.currency)}</span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      render: (payment: Payment) => (
        <span className="capitalize">{PAYMENT_METHOD_LABELS[payment.method] || payment.method}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (payment: Payment) => getStatusBadge(payment.status),
    },
    {
      key: 'mode',
      header: 'Mode',
      render: (payment: Payment) => getModeBadge(payment.mode || 'test'),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (payment: Payment) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDateTime(payment.created_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (payment: Payment) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(payment);
          }}
        >
          View
        </Button>
      ),
    },
  ];

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monitor all Razorpay transactions
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
        >
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div className="col-span-1">
            <Select
              label="Status"
              value={filters.status || 'all'}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as PaymentStatus | 'all' })}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'captured', label: 'Success' },
                { value: 'failed', label: 'Failed' },
                { value: 'created', label: 'Pending' },
                { value: 'authorized', label: 'Authorized' },
              ]}
            />
          </div>

          <div className="col-span-1">
            <Select
              label="Mode"
              value={filters.mode || 'all'}
              onChange={(e) => setFilters({ ...filters, mode: e.target.value as RazorpayMode | 'all' })}
              options={[
                { value: 'all', label: 'All Modes' },
                { value: 'test', label: 'Test' },
                { value: 'live', label: 'Live' },
              ]}
            />
          </div>

          <div className="col-span-1">
            <Select
              label="Method"
              value={filters.method || 'all'}
              onChange={(e) => setFilters({ ...filters, method: e.target.value as PaymentMethod | 'all' })}
              options={[
                { value: 'all', label: 'All Methods' },
                { value: 'card', label: 'Card' },
                { value: 'upi', label: 'UPI' },
                { value: 'netbanking', label: 'Netbanking' },
                { value: 'wallet', label: 'Wallet' },
              ]}
            />
          </div>

          <div className="col-span-2 sm:col-span-2 lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Date Range
            </label>
            <DateRangePicker
              startDate={filters.startDate || ''}
              endDate={filters.endDate || ''}
              onStartDateChange={(date) => setFilters({ ...filters, startDate: date })}
              onEndDateChange={(date) => setFilters({ ...filters, endDate: date })}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
              Clear Filters
            </Button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredPayments.length} of {payments.length} payments
        </div>
      </Card>

      {/* Payments Table */}
      <Card padding="none">
        <Table
          columns={columns}
          data={paginatedPayments}
          keyExtractor={(payment) => payment.id}
          isLoading={isLoading}
          emptyMessage="No payments found matching your filters"
          onRowClick={handleViewDetails}
        />

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Payment Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Payment Details"
        size="lg"
      >
        {selectedPayment && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`p-4 rounded-lg ${PAYMENT_STATUS_COLORS[selectedPayment.status]?.bg || 'bg-gray-100'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Status</p>
                  <p className={`text-xl font-bold ${PAYMENT_STATUS_COLORS[selectedPayment.status]?.text || 'text-gray-700'}`}>
                    {PAYMENT_STATUS_LABELS[selectedPayment.status] || selectedPayment.status}
                  </p>
                </div>
                {getModeBadge(selectedPayment.mode || 'test')}
              </div>
            </div>

            {/* Amount */}
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem label="Payment ID" value={selectedPayment.id} mono />
              <DetailItem label="Order ID" value={selectedPayment.order_id || '-'} mono />
              <DetailItem label="Method" value={PAYMENT_METHOD_LABELS[selectedPayment.method] || selectedPayment.method} />
              <DetailItem label="Date" value={formatDateTime(selectedPayment.created_at)} />
              <DetailItem label="Email" value={selectedPayment.email || '-'} />
              <DetailItem label="Contact" value={selectedPayment.contact || '-'} />
              {selectedPayment.bank && <DetailItem label="Bank" value={selectedPayment.bank} />}
              {selectedPayment.wallet && <DetailItem label="Wallet" value={selectedPayment.wallet} />}
              {selectedPayment.vpa && <DetailItem label="VPA" value={selectedPayment.vpa} />}
            </div>

            {/* Fees */}
            {(selectedPayment.fee > 0 || selectedPayment.tax > 0) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Razorpay Fee</span>
                  <span className="font-medium">{formatCurrency(selectedPayment.fee)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500 dark:text-gray-400">Tax</span>
                  <span className="font-medium">{formatCurrency(selectedPayment.tax)}</span>
                </div>
              </div>
            )}

            {/* Error Details (if failed) */}
            {selectedPayment.status === 'failed' && selectedPayment.error_description && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">Error Details</p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  {selectedPayment.error_description}
                </p>
                {selectedPayment.error_code && (
                  <p className="text-xs text-red-500 mt-2 font-mono">
                    Code: {selectedPayment.error_code}
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            {selectedPayment.notes && Object.keys(selectedPayment.notes).length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  {Object.entries(selectedPayment.notes).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm py-1">
                      <span className="text-gray-500 dark:text-gray-400 capitalize">{key}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

const DetailItem = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => (
  <div>
    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    <p className={`text-sm font-medium text-gray-900 dark:text-white ${mono ? 'font-mono' : ''}`}>
      {value}
    </p>
  </div>
);
