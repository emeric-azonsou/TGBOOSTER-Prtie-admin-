/**
 * Withdrawal Service
 * Professional service layer for withdrawal management with PawaPay integration
 */

import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatRelativeTime } from "@/lib/utils/formatters";
import type {
  Withdrawal,
  WithdrawalFilters,
  PaginatedWithdrawals,
  WithdrawalStats,
  WithdrawalStatus,
  WithdrawalProcessRequest,
} from "@/types/finance.types";

export class WithdrawalService {
  /**
   * Get paginated withdrawals with filters
   */
  static async getWithdrawals(
    filters: WithdrawalFilters = {}
  ): Promise<PaginatedWithdrawals> {
    const supabase = await createClient();
    const {
      search = "",
      status = "all",
      paymentMethod = "all",
      mobileMoneyProvider = "all",
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
        .from("withdrawal_requests")
        .select(
          `
          *,
          executant_profiles!withdrawal_requests_executant_id_fkey (
            executant_id,
            user_profiles!executant_profiles_executant_id_fkey (
              first_name,
              last_name,
              email,
              phone
            )
          )
        `,
          { count: "exact" }
        );

      if (status !== "all") {
        query = query.eq("status", status);
      }

      if (paymentMethod !== "all") {
        query = query.eq("payment_method", paymentMethod);
      }

      if (dateFrom) {
        query = query.gte("requested_at", dateFrom);
      }

      if (dateTo) {
        query = query.lte("requested_at", dateTo);
      }

      if (search) {
        query = query.or(
          `external_transaction_id.ilike.%${search}%,rejection_reason.ilike.%${search}%`
        );
      }

      const sortColumn =
        sortBy === "date"
          ? "requested_at"
          : sortBy === "amount"
            ? "amount_cents"
            : "status";

      query = query.order(sortColumn, { ascending: sortOrder === "asc" });

      const start = (page - 1) * limit;
      const end = start + limit - 1;
      query = query.range(start, end);

      const { data, error, count } = await query;

      if (error) throw error;

      const withdrawals: Withdrawal[] = await Promise.all(
        (data || []).map(async (wd) => {
          const profile = Array.isArray(wd.executant_profiles)
            ? wd.executant_profiles[0]
            : wd.executant_profiles;

          const userProfile = profile?.user_profiles
            ? Array.isArray(profile.user_profiles)
              ? profile.user_profiles[0]
              : profile.user_profiles
            : null;

          const executantName = userProfile
            ? `${userProfile.first_name} ${userProfile.last_name}`
            : "Exécutant inconnu";

          const executantWallet = await supabase
            .from("executant_wallets")
            .select("*")
            .eq("executant_id", wd.executant_id)
            .single();

          const executantStats = await supabase
            .from("task_executions")
            .select("status, reward_cents")
            .eq("executant_id", wd.executant_id);

          const tasksCompleted =
            executantStats.data?.filter((t) => t.status === "completed")
              .length || 0;

          const totalEarned =
            executantStats.data
              ?.filter((t) => t.status === "completed")
              .reduce((sum, t) => sum + (t.reward_cents || 0), 0) || 0;

          const validationRate = executantStats.data
            ? (tasksCompleted / executantStats.data.length) * 100
            : 0;

          const lastWithdrawal = await supabase
            .from("withdrawal_requests")
            .select("completed_at")
            .eq("executant_id", wd.executant_id)
            .eq("status", "completed")
            .order("completed_at", { ascending: false })
            .limit(1)
            .single();

          let processedByName: string | undefined;
          if (wd.processed_by) {
            const { data: processor } = await supabase
              .from("user_profiles")
              .select("first_name, last_name")
              .eq("id", wd.processed_by)
              .single();

            if (processor) {
              processedByName = `${processor.first_name} ${processor.last_name}`;
            }
          }

          const paymentDetails =
            typeof wd.payment_details === "object" ? wd.payment_details : {};

          return {
            withdrawal_id: wd.withdrawal_id,
            executant_id: wd.executant_id,
            executant_name: executantName,
            executant_email: userProfile?.email || "",
            executant_phone: userProfile?.phone || "",
            executant_verified: userProfile?.email_verified || false,
            amount_cents: wd.amount_cents,
            amount_formatted: formatCurrency(wd.amount_cents),
            status: wd.status as WithdrawalStatus,
            payment_method: wd.payment_method,
            mobile_money_provider: paymentDetails.provider,
            mobile_money_number: paymentDetails.mobile_money_number,
            bank_account_number: paymentDetails.account_number,
            bank_name: paymentDetails.bank_name,
            external_transaction_id: wd.external_transaction_id,
            rejection_reason: wd.rejection_reason,
            processed_by: wd.processed_by,
            processed_by_name: processedByName,
            requested_at: wd.requested_at,
            requested_at_relative: formatRelativeTime(wd.requested_at),
            processed_at: wd.processed_at,
            processed_at_relative: wd.processed_at
              ? formatRelativeTime(wd.processed_at)
              : undefined,
            completed_at: wd.completed_at,
            completed_at_relative: wd.completed_at
              ? formatRelativeTime(wd.completed_at)
              : undefined,
            executant_stats: {
              available_balance_cents:
                executantWallet.data?.balance_cents || 0,
              available_balance_formatted: formatCurrency(
                executantWallet.data?.balance_cents || 0
              ),
              total_earned_cents: totalEarned,
              total_earned_formatted: formatCurrency(totalEarned),
              total_withdrawn_cents:
                executantWallet.data?.total_earned_cents || 0,
              total_withdrawn_formatted: formatCurrency(
                executantWallet.data?.total_earned_cents || 0
              ),
              tasks_completed: tasksCompleted,
              validation_rate: Math.round(validationRate),
              last_withdrawal_date: lastWithdrawal.data?.completed_at,
              last_withdrawal_relative: lastWithdrawal.data?.completed_at
                ? formatRelativeTime(lastWithdrawal.data.completed_at)
                : undefined,
            },
            metadata: wd.metadata,
          };
        })
      );

      const stats = await this.getWithdrawalStats(filters);

      return {
        withdrawals,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        stats,
      };
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      return this.getEmptyResponse();
    }
  }

  /**
   * Get withdrawal statistics
   */
  static async getWithdrawalStats(
    filters: WithdrawalFilters = {}
  ): Promise<WithdrawalStats> {
    const supabase = await createClient();

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return this.getEmptyStats();
      }

      const { count: totalPending } = await supabase
        .from("withdrawal_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: totalApproved } = await supabase
        .from("withdrawal_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");

      const { count: totalRejected } = await supabase
        .from("withdrawal_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "rejected");

      const { count: totalCompleted } = await supabase
        .from("withdrawal_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      const { data: pendingWithdrawals } = await supabase
        .from("withdrawal_requests")
        .select("amount_cents")
        .eq("status", "pending");

      const pendingAmountCents =
        pendingWithdrawals?.reduce(
          (sum, w) => sum + (w.amount_cents || 0),
          0
        ) || 0;

      const { data: processingTimes } = await supabase
        .from("withdrawal_requests")
        .select("requested_at, processed_at")
        .eq("status", "completed")
        .not("requested_at", "is", null)
        .not("processed_at", "is", null);

      let averageProcessingTimeHours: number | null = null;
      if (processingTimes && processingTimes.length > 0) {
        const times = processingTimes.map((w) => {
          const requested = new Date(w.requested_at!).getTime();
          const processed = new Date(w.processed_at!).getTime();
          return (processed - requested) / 1000 / 60 / 60;
        });
        averageProcessingTimeHours =
          times.reduce((a, b) => a + b, 0) / times.length;
      }

      const { data: oldestPendingData } = await supabase
        .from("withdrawal_requests")
        .select("requested_at")
        .eq("status", "pending")
        .order("requested_at", { ascending: true })
        .limit(1)
        .single();

      return {
        totalPending: totalPending || 0,
        totalApproved: totalApproved || 0,
        totalRejected: totalRejected || 0,
        totalCompleted: totalCompleted || 0,
        pendingAmountCents,
        pendingAmountFormatted: formatCurrency(pendingAmountCents),
        averageProcessingTimeHours,
        oldestPending: oldestPendingData?.requested_at || null,
      };
    } catch (error) {
      console.error("Error fetching withdrawal stats:", error);
      return this.getEmptyStats();
    }
  }

  /**
   * Get withdrawal by ID
   */
  static async getWithdrawalById(
    withdrawalId: string
  ): Promise<Withdrawal | null> {
    const supabase = await createClient();

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return null;
      }

      const withdrawals = await this.getWithdrawals({
        page: 1,
        limit: 100,
      });

      return (
        withdrawals.withdrawals.find(
          (w) => w.withdrawal_id === withdrawalId
        ) || null
      );
    } catch (error) {
      console.error("Error fetching withdrawal by ID:", error);
      return null;
    }
  }

  /**
   * Process withdrawal (approve, reject, hold)
   */
  static async processWithdrawal(
    request: WithdrawalProcessRequest
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: "Non authentifié" };
      }

      const updates: Record<string, unknown> = {
        processed_by: user.id,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (request.action === "approve") {
        updates.status = "approved";
        if (request.external_transaction_id) {
          updates.external_transaction_id = request.external_transaction_id;
        }
      } else if (request.action === "reject") {
        updates.status = "rejected";
        if (request.rejection_reason) {
          updates.rejection_reason = request.rejection_reason;
        }
      } else if (request.action === "hold") {
        updates.status = "pending";
      }

      if (request.notes) {
        updates.metadata = { notes: request.notes };
      }

      const { error } = await supabase
        .from("withdrawal_requests")
        .update(updates)
        .eq("withdrawal_id", request.withdrawal_id);

      if (error) throw error;

      if (request.action === "approve") {
        const withdrawal = await this.getWithdrawalById(request.withdrawal_id);
        if (withdrawal) {
          await this.deductFromWallet(
            withdrawal.executant_id,
            withdrawal.amount_cents
          );
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors du traitement du retrait",
      };
    }
  }

  /**
   * Deduct amount from executant wallet
   */
  private static async deductFromWallet(
    executantId: string,
    amountCents: number
  ): Promise<void> {
    const supabase = await createClient();

    const { data: wallet } = await supabase
      .from("executant_wallets")
      .select("balance_cents")
      .eq("executant_id", executantId)
      .single();

    if (wallet) {
      const newBalance = wallet.balance_cents - amountCents;

      await supabase
        .from("executant_wallets")
        .update({
          balance_cents: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("executant_id", executantId);
    }
  }

  /**
   * Helper: Get empty response
   */
  private static getEmptyResponse(): PaginatedWithdrawals {
    return {
      withdrawals: [],
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
  private static getEmptyStats(): WithdrawalStats {
    return {
      totalPending: 0,
      totalApproved: 0,
      totalRejected: 0,
      totalCompleted: 0,
      pendingAmountCents: 0,
      pendingAmountFormatted: "0 FCFA",
      averageProcessingTimeHours: null,
      oldestPending: null,
    };
  }
}
