/**
 * Reconciliation Service
 * Professional service layer for financial reconciliation management
 */

import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils/formatters";
import type {
  Reconciliation,
  ReconciliationFilters,
  PaginatedReconciliations,
  ReconciliationStats,
} from "@/types/finance.types";

export class ReconciliationService {
  /**
   * Get paginated reconciliations with filters
   */
  static async getReconciliations(
    filters: ReconciliationFilters = {}
  ): Promise<PaginatedReconciliations> {
    const supabase = await createClient();
    const {
      provider = "all",
      status = "all",
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
        .from("financial_reconciliations")
        .select("*", { count: "exact" });

      if (provider !== "all") {
        query = query.eq("provider", provider);
      }

      if (status !== "all") {
        query = query.eq("status", status);
      }

      if (dateFrom) {
        query = query.gte("period_start", dateFrom);
      }

      if (dateTo) {
        query = query.lte("period_end", dateTo);
      }

      const sortColumn =
        sortBy === "date"
          ? "created_at"
          : sortBy === "amount"
            ? "internal_amount_cents"
            : "status";

      query = query.order(sortColumn, { ascending: sortOrder === "asc" });

      const start = (page - 1) * limit;
      const end = start + limit - 1;
      query = query.range(start, end);

      const { data, error, count } = await query;

      if (error) throw error;

      const reconciliations: Reconciliation[] = await Promise.all(
        (data || []).map(async (rec) => {
          let reconciledByName: string | undefined;
          if (rec.reconciled_by) {
            const { data: reconciler } = await supabase
              .from("user_profiles")
              .select("first_name, last_name")
              .eq("id", rec.reconciled_by)
              .single();

            if (reconciler) {
              reconciledByName = `${reconciler.first_name} ${reconciler.last_name}`;
            }
          }

          const differenceCents =
            rec.internal_amount_cents - rec.external_amount_cents;

          return {
            reconciliation_id: rec.reconciliation_id,
            provider: rec.provider,
            provider_name: this.getProviderName(rec.provider),
            period_start: rec.period_start,
            period_end: rec.period_end,
            internal_amount_cents: rec.internal_amount_cents,
            internal_amount_formatted: formatCurrency(
              rec.internal_amount_cents
            ),
            external_amount_cents: rec.external_amount_cents,
            external_amount_formatted: formatCurrency(
              rec.external_amount_cents
            ),
            difference_cents: differenceCents,
            difference_formatted: formatCurrency(Math.abs(differenceCents)),
            status: rec.status,
            transaction_count_internal: rec.transaction_count_internal || 0,
            transaction_count_external: rec.transaction_count_external || 0,
            notes: rec.notes,
            reconciled_by: rec.reconciled_by,
            reconciled_by_name: reconciledByName,
            reconciled_at: rec.reconciled_at,
            created_at: rec.created_at,
          };
        })
      );

      const stats = await this.getReconciliationStats(filters);

      return {
        reconciliations,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        stats,
      };
    } catch (error) {
      console.error("Error fetching reconciliations:", error);
      return this.getEmptyResponse();
    }
  }

  /**
   * Get reconciliation statistics
   */
  static async getReconciliationStats(
    filters: ReconciliationFilters = {}
  ): Promise<ReconciliationStats> {
    const supabase = await createClient();

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return this.getEmptyStats();
      }

      const { count: totalMatched } = await supabase
        .from("financial_reconciliations")
        .select("*", { count: "exact", head: true })
        .eq("status", "matched");

      const { count: totalMismatch } = await supabase
        .from("financial_reconciliations")
        .select("*", { count: "exact", head: true })
        .eq("status", "mismatch");

      const { count: totalPending } = await supabase
        .from("financial_reconciliations")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { data: mismatches } = await supabase
        .from("financial_reconciliations")
        .select("internal_amount_cents, external_amount_cents")
        .eq("status", "mismatch");

      const totalDifferenceCents =
        mismatches?.reduce((sum, m) => {
          return sum + Math.abs(m.internal_amount_cents - m.external_amount_cents);
        }, 0) || 0;

      return {
        totalMatched: totalMatched || 0,
        totalMismatch: totalMismatch || 0,
        totalPending: totalPending || 0,
        totalDifferenceCents,
        totalDifferenceFormatted: formatCurrency(totalDifferenceCents),
      };
    } catch (error) {
      console.error("Error fetching reconciliation stats:", error);
      return this.getEmptyStats();
    }
  }

  /**
   * Create new reconciliation record
   */
  static async createReconciliation(
    provider: string,
    periodStart: string,
    periodEnd: string,
    internalAmountCents: number,
    externalAmountCents: number,
    transactionCountInternal: number,
    transactionCountExternal: number,
    notes?: string
  ): Promise<{ success: boolean; reconciliationId?: string; error?: string }> {
    const supabase = await createClient();

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: "Non authentifié" };
      }

      const differenceCents = internalAmountCents - externalAmountCents;
      const status = Math.abs(differenceCents) < 100 ? "matched" : "mismatch";

      const { data, error } = await supabase
        .from("financial_reconciliations")
        .insert({
          provider,
          period_start: periodStart,
          period_end: periodEnd,
          internal_amount_cents: internalAmountCents,
          external_amount_cents: externalAmountCents,
          transaction_count_internal: transactionCountInternal,
          transaction_count_external: transactionCountExternal,
          status,
          notes,
          reconciled_by: user.id,
          reconciled_at: new Date().toISOString(),
        })
        .select("reconciliation_id")
        .single();

      if (error) throw error;

      return {
        success: true,
        reconciliationId: data?.reconciliation_id,
      };
    } catch (error) {
      console.error("Error creating reconciliation:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la création du rapprochement",
      };
    }
  }

  /**
   * Update reconciliation status
   */
  static async updateReconciliationStatus(
    reconciliationId: string,
    status: "matched" | "mismatch" | "pending",
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: "Non authentifié" };
      }

      const { error } = await supabase
        .from("financial_reconciliations")
        .update({
          status,
          notes,
          reconciled_by: user.id,
          reconciled_at: new Date().toISOString(),
        })
        .eq("reconciliation_id", reconciliationId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Error updating reconciliation status:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la mise à jour du rapprochement",
      };
    }
  }

  /**
   * Get provider display name
   */
  private static getProviderName(provider: string): string {
    const providerMap: Record<string, string> = {
      mtn_momo: "MTN Mobile Money",
      moov_money: "Moov Money",
      celtiis_cash: "Celtiis Cash",
      fedapay: "FedaPay",
      lygos: "Lygos",
      pawapay: "PawaPay",
    };

    return providerMap[provider] || provider;
  }

  /**
   * Helper: Get empty response
   */
  private static getEmptyResponse(): PaginatedReconciliations {
    return {
      reconciliations: [],
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
  private static getEmptyStats(): ReconciliationStats {
    return {
      totalMatched: 0,
      totalMismatch: 0,
      totalPending: 0,
      totalDifferenceCents: 0,
      totalDifferenceFormatted: "0 FCFA",
    };
  }
}
