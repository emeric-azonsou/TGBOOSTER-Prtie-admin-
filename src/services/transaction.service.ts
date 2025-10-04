/**
 * Transaction Service
 * Professional service layer for financial transaction management
 */

import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatRelativeTime } from "@/lib/utils/formatters";
import type {
  Transaction,
  TransactionFilters,
  PaginatedTransactions,
  TransactionStats,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
} from "@/types/finance.types";

export class TransactionService {
  /**
   * Get paginated transactions with filters
   */
  static async getTransactions(
    filters: TransactionFilters = {}
  ): Promise<PaginatedTransactions> {
    const supabase = await createClient();
    const {
      search = "",
      type = "all",
      status = "all",
      userType = "all",
      paymentMethod = "all",
      dateFrom,
      dateTo,
      sortBy = "date",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = filters;

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Authentication error:", authError);
        return this.getEmptyResponse();
      }

      let query = supabase
        .from("financial_transactions")
        .select("*", { count: "exact" });

      if (type !== "all") {
        query = query.eq("transaction_type", type);
      }

      if (status !== "all") {
        query = query.eq("status", status);
      }

      if (userType !== "all") {
        query = query.eq("user_type", userType);
      }

      if (paymentMethod !== "all") {
        query = query.eq("payment_method", paymentMethod);
      }

      if (dateFrom) {
        query = query.gte("created_at", dateFrom);
      }

      if (dateTo) {
        query = query.lte("created_at", dateTo);
      }

      if (search) {
        query = query.or(
          `reference.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      const sortColumn =
        sortBy === "date"
          ? "created_at"
          : sortBy === "amount"
            ? "amount_cents"
            : "status";

      query = query.order(sortColumn, { ascending: sortOrder === "asc" });

      const start = (page - 1) * limit;
      const end = start + limit - 1;
      query = query.range(start, end);

      const { data, error, count } = await query;

      if (error) throw error;

      const transactions: Transaction[] = await Promise.all(
        (data || []).map(async (tx) => {
          let userName = "Utilisateur inconnu";
          let userEmail = "";

          const { data: userProfile } = await supabase
            .from("user_profiles")
            .select("first_name, last_name, email")
            .eq("id", tx.user_id)
            .single();

          if (userProfile) {
            userName = `${userProfile.first_name} ${userProfile.last_name}`;
            userEmail = userProfile.email;
          }

          return {
            transaction_id: tx.transaction_id,
            user_id: tx.user_id,
            user_name: userName,
            user_email: userEmail,
            user_type: tx.user_type,
            transaction_type: tx.transaction_type as TransactionType,
            amount_cents: tx.amount_cents,
            amount_formatted: formatCurrency(tx.amount_cents),
            reference: tx.reference,
            payment_method: tx.payment_method as PaymentMethod,
            status: tx.status as TransactionStatus,
            description: tx.description,
            metadata: tx.metadata,
            created_at: tx.created_at,
            created_at_relative: formatRelativeTime(tx.created_at),
            completed_at: tx.completed_at,
          };
        })
      );

      const stats = await this.getTransactionStats(filters);

      return {
        transactions,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        stats,
      };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return this.getEmptyResponse();
    }
  }

  /**
   * Get transaction statistics
   */
  static async getTransactionStats(
    filters: TransactionFilters = {}
  ): Promise<TransactionStats> {
    const supabase = await createClient();

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return this.getEmptyStats();
      }

      let baseQuery = supabase.from("financial_transactions").select("amount_cents, transaction_type, status");

      if (filters.dateFrom) {
        baseQuery = baseQuery.gte("created_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        baseQuery = baseQuery.lte("created_at", filters.dateTo);
      }

      const { data, error } = await baseQuery;

      if (error) throw error;

      const stats = (data || []).reduce(
        (acc, tx) => {
          const amount = tx.amount_cents || 0;

          if (tx.transaction_type === "deposit") {
            acc.totalDeposits += amount;
          } else if (tx.transaction_type === "withdrawal") {
            acc.totalWithdrawals += amount;
          } else if (tx.transaction_type === "refund") {
            acc.totalRefunds += amount;
          }

          if (tx.status === "pending") {
            acc.pendingAmount += amount;
          } else if (tx.status === "completed") {
            acc.completedAmount += amount;
          } else if (tx.status === "failed") {
            acc.failedAmount += amount;
          }

          return acc;
        },
        {
          totalDeposits: 0,
          totalWithdrawals: 0,
          totalRefunds: 0,
          pendingAmount: 0,
          completedAmount: 0,
          failedAmount: 0,
        }
      );

      return stats;
    } catch (error) {
      console.error("Error fetching transaction stats:", error);
      return this.getEmptyStats();
    }
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(
    transactionId: string
  ): Promise<Transaction | null> {
    const supabase = await createClient();

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return null;
      }

      const { data, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .eq("transaction_id", transactionId)
        .single();

      if (error) throw error;
      if (!data) return null;

      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("first_name, last_name, email")
        .eq("id", data.user_id)
        .single();

      return {
        transaction_id: data.transaction_id,
        user_id: data.user_id,
        user_name: userProfile
          ? `${userProfile.first_name} ${userProfile.last_name}`
          : "Utilisateur inconnu",
        user_email: userProfile?.email || "",
        user_type: data.user_type,
        transaction_type: data.transaction_type as TransactionType,
        amount_cents: data.amount_cents,
        amount_formatted: formatCurrency(data.amount_cents),
        reference: data.reference,
        payment_method: data.payment_method as PaymentMethod,
        status: data.status as TransactionStatus,
        description: data.description,
        metadata: data.metadata,
        created_at: data.created_at,
        created_at_relative: formatRelativeTime(data.created_at),
        completed_at: data.completed_at,
      };
    } catch (error) {
      console.error("Error fetching transaction by ID:", error);
      return null;
    }
  }

  /**
   * Helper: Get empty response
   */
  private static getEmptyResponse(): PaginatedTransactions {
    return {
      transactions: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      stats: this.getEmptyStats(),
    };
  }

  /**
   * Helper: Get empty stats
   */
  private static getEmptyStats(): TransactionStats {
    return {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalRefunds: 0,
      pendingAmount: 0,
      completedAmount: 0,
      failedAmount: 0,
    };
  }
}
