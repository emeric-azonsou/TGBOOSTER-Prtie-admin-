/**
 * Finance Types
 * Type definitions for financial operations, wallets, transactions, and withdrawals
 */

export type TransactionType = 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'commission';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type PaymentMethod = 'card' | 'mobile_money' | 'bank_transfer' | 'paypal';
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type MobileMoneyProvider = 'mtn_momo' | 'moov_money' | 'celtiis_cash';

export interface Transaction {
  transaction_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_type: 'client' | 'executant';
  transaction_type: TransactionType;
  amount_cents: number;
  amount_formatted: string;
  reference: string;
  payment_method: PaymentMethod;
  status: TransactionStatus;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  created_at_relative: string;
  completed_at?: string;
}

export interface TransactionFilters {
  search?: string;
  type?: TransactionType | 'all';
  status?: TransactionStatus | 'all';
  userType?: 'client' | 'executant' | 'all';
  paymentMethod?: PaymentMethod | 'all';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: TransactionStats;
}

export interface TransactionStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalRefunds: number;
  pendingAmount: number;
  completedAmount: number;
  failedAmount: number;
}

export interface Withdrawal {
  withdrawal_id: string;
  executant_id: string;
  executant_name: string;
  executant_email: string;
  executant_phone: string;
  executant_verified: boolean;
  amount_cents: number;
  amount_formatted: string;
  status: WithdrawalStatus;
  payment_method: PaymentMethod;
  mobile_money_provider?: MobileMoneyProvider;
  mobile_money_number?: string;
  bank_account_number?: string;
  bank_name?: string;
  external_transaction_id?: string;
  rejection_reason?: string;
  processed_by?: string;
  processed_by_name?: string;
  requested_at: string;
  requested_at_relative: string;
  processed_at?: string;
  processed_at_relative?: string;
  completed_at?: string;
  completed_at_relative?: string;
  executant_stats: {
    available_balance_cents: number;
    available_balance_formatted: string;
    total_earned_cents: number;
    total_earned_formatted: string;
    total_withdrawn_cents: number;
    total_withdrawn_formatted: string;
    tasks_completed: number;
    validation_rate: number;
    last_withdrawal_date?: string;
    last_withdrawal_relative?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface WithdrawalFilters {
  search?: string;
  status?: WithdrawalStatus | 'all';
  paymentMethod?: PaymentMethod | 'all';
  mobileMoneyProvider?: MobileMoneyProvider | 'all';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedWithdrawals {
  withdrawals: Withdrawal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: WithdrawalStats;
}

export interface WithdrawalStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalCompleted: number;
  pendingAmountCents: number;
  pendingAmountFormatted: string;
  averageProcessingTimeHours: number | null;
  oldestPending: string | null;
}

export interface ClientWallet {
  wallet_id: string;
  client_id: string;
  balance_cents: number;
  balance_formatted: string;
  pending_cents: number;
  pending_formatted: string;
  total_spent_cents: number;
  total_spent_formatted: string;
  currency_code: string;
  created_at: string;
  updated_at: string;
}

export interface ExecutantWallet {
  wallet_id: string;
  executant_id: string;
  balance_cents: number;
  balance_formatted: string;
  pending_cents: number;
  pending_formatted: string;
  total_earned_cents: number;
  total_earned_formatted: string;
  currency_code: string;
  created_at: string;
  updated_at: string;
}

export interface Reconciliation {
  reconciliation_id: string;
  provider: MobileMoneyProvider | 'fedapay' | 'lygos';
  provider_name: string;
  period_start: string;
  period_end: string;
  internal_amount_cents: number;
  internal_amount_formatted: string;
  external_amount_cents: number;
  external_amount_formatted: string;
  difference_cents: number;
  difference_formatted: string;
  status: 'matched' | 'mismatch' | 'pending';
  transaction_count_internal: number;
  transaction_count_external: number;
  notes?: string;
  reconciled_by?: string;
  reconciled_by_name?: string;
  reconciled_at?: string;
  created_at: string;
}

export interface ReconciliationFilters {
  provider?: MobileMoneyProvider | 'fedapay' | 'lygos' | 'all';
  status?: 'matched' | 'mismatch' | 'pending' | 'all';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedReconciliations {
  reconciliations: Reconciliation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: ReconciliationStats;
}

export interface ReconciliationStats {
  totalMatched: number;
  totalMismatch: number;
  totalPending: number;
  totalDifferenceCents: number;
  totalDifferenceFormatted: string;
}

export interface WithdrawalProcessRequest {
  withdrawal_id: string;
  action: 'approve' | 'reject' | 'hold';
  external_transaction_id?: string;
  rejection_reason?: string;
  notes?: string;
}

export interface WalletAdjustment {
  user_id: string;
  user_type: 'client' | 'executant';
  adjustment_type: 'credit' | 'debit';
  amount_cents: number;
  reason: string;
  admin_id: string;
  reference?: string;
}
