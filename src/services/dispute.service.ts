/**
 * Dispute Service
 * Professional service layer for dispute management
 */

import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatRelativeTime } from "@/lib/utils/formatters";
import type {
  Dispute,
  DisputeFilters,
  PaginatedDisputes,
  DisputeStats,
  DisputePriority,
  DisputeResolution,
} from "@/types/dispute.types";

export class DisputeService {
  /**
   * Get paginated disputes
   */
  static async getDisputes(
    filters: DisputeFilters = {}
  ): Promise<PaginatedDisputes> {
    const supabase = await createClient();
    const {
      search = "",
      status = "all",
      priority = "all",
      submittedBy = "all",
      assignedTo,
      dateFrom,
      dateTo,
      sortBy = "submittedDate",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = filters;

    try {
      let query = supabase
        .from("disputes")
        .select(
          `
          *,
          task_executions!disputes_task_execution_id_fkey (
            task_id,
            executant_id,
            tasks!task_executions_task_id_fkey (
              title,
              client_id
            )
          )
        `,
          { count: "exact" }
        );

      if (status !== "all") {
        query = query.eq("status", status);
      }

      if (priority !== "all") {
        query = query.eq("priority", priority);
      }

      if (submittedBy !== "all") {
        query = query.eq("submitted_by", submittedBy);
      }

      if (assignedTo) {
        query = query.eq("assigned_to", assignedTo);
      }

      if (dateFrom) {
        query = query.gte("submitted_at", dateFrom);
      }

      if (dateTo) {
        query = query.lte("submitted_at", dateTo);
      }

      if (search) {
        query = query.or(`reason.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const sortColumn =
        sortBy === "submittedDate"
          ? "submitted_at"
          : sortBy === "priority"
            ? "priority"
            : "submitted_at";

      query = query.order(sortColumn, { ascending: sortOrder === "asc" });

      const start = (page - 1) * limit;
      const end = start + limit - 1;
      query = query.range(start, end);

      const { data, error, count } = await query;

      if (error) throw error;

      const disputes: Dispute[] = await Promise.all(
        (data || []).map(async (dispute) => {
          const execution = Array.isArray(dispute.task_executions)
            ? dispute.task_executions[0]
            : dispute.task_executions;

          const task = execution?.tasks;
          const taskData = Array.isArray(task) ? task[0] : task;

          let clientName = "Client inconnu";
          let clientEmail = "";
          let executantName = "Exécutant inconnu";
          let executantEmail = "";
          let moderatorName = null;

          if (taskData?.client_id) {
            const { data: clientProfile } = await supabase
              .from("client_profiles")
              .select("client_id, user_profiles!client_profiles_client_id_fkey(first_name, last_name, email)")
              .eq("client_id", taskData.client_id)
              .single();

            if (clientProfile) {
              const user = Array.isArray(clientProfile.user_profiles)
                ? clientProfile.user_profiles[0]
                : clientProfile.user_profiles;
              if (user) {
                clientName = `${user.first_name} ${user.last_name}`;
                clientEmail = user.email;
              }
            }
          }

          if (execution?.executant_id) {
            const { data: executantProfile } = await supabase
              .from("executant_profiles")
              .select("executant_id, user_profiles!executant_profiles_executant_id_fkey(first_name, last_name, email)")
              .eq("executant_id", execution.executant_id)
              .single();

            if (executantProfile) {
              const user = Array.isArray(executantProfile.user_profiles)
                ? executantProfile.user_profiles[0]
                : executantProfile.user_profiles;
              if (user) {
                executantName = `${user.first_name} ${user.last_name}`;
                executantEmail = user.email;
              }
            }
          }

          if (dispute.assigned_to) {
            const { data: moderator } = await supabase
              .from("user_profiles")
              .select("first_name, last_name")
              .eq("id", dispute.assigned_to)
              .single();

            if (moderator) {
              moderatorName = `${moderator.first_name} ${moderator.last_name}`;
            }
          }

          return {
            dispute_id: dispute.dispute_id,
            task_execution_id: dispute.task_execution_id,
            task_id: execution?.task_id || "",
            campaign_title: taskData?.title || "Campagne inconnue",
            client_id: taskData?.client_id || "",
            client_name: clientName,
            client_email: clientEmail,
            executant_id: execution?.executant_id || "",
            executant_name: executantName,
            executant_email: executantEmail,
            reason: dispute.reason,
            description: dispute.description,
            evidence_urls: dispute.evidence_urls,
            status: dispute.status,
            priority: dispute.priority,
            submitted_by: dispute.submitted_by,
            submitted_at: dispute.submitted_at,
            submitted_at_relative: formatRelativeTime(dispute.submitted_at),
            assigned_to: dispute.assigned_to,
            moderator_name: moderatorName,
            resolution: dispute.resolution,
            resolution_notes: dispute.resolution_notes,
            resolved_at: dispute.resolved_at,
            resolved_at_relative: dispute.resolved_at
              ? formatRelativeTime(dispute.resolved_at)
              : null,
            refund_amount_cents: dispute.refund_amount_cents,
            refund_amount_formatted: dispute.refund_amount_cents
              ? formatCurrency(dispute.refund_amount_cents)
              : null,
            metadata: dispute.metadata,
          };
        })
      );

      const stats = await this.getDisputeStats();

      return {
        disputes,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        stats,
      };
    } catch (error) {
      console.error("Error fetching disputes:", error);
      return {
        disputes: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        stats: {
          totalPending: 0,
          totalInvestigating: 0,
          totalResolved: 0,
          totalEscalated: 0,
          averageResolutionTime: null,
          oldestPending: null,
          resolutionRate: 0,
        },
      };
    }
  }

  /**
   * Get dispute statistics
   */
  static async getDisputeStats(): Promise<DisputeStats> {
    const supabase = await createClient();

    try {
      const { count: totalPending } = await supabase
        .from("disputes")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: totalInvestigating } = await supabase
        .from("disputes")
        .select("*", { count: "exact", head: true })
        .eq("status", "investigating");

      const { count: totalResolved } = await supabase
        .from("disputes")
        .select("*", { count: "exact", head: true })
        .eq("status", "resolved");

      const { count: totalEscalated } = await supabase
        .from("disputes")
        .select("*", { count: "exact", head: true })
        .eq("status", "escalated");

      const { data: resolutionTimes } = await supabase
        .from("disputes")
        .select("submitted_at, resolved_at")
        .eq("status", "resolved")
        .not("submitted_at", "is", null)
        .not("resolved_at", "is", null);

      let averageResolutionTime: number | null = null;
      if (resolutionTimes && resolutionTimes.length > 0) {
        const times = resolutionTimes.map((d) => {
          const submitted = new Date(d.submitted_at!).getTime();
          const resolved = new Date(d.resolved_at!).getTime();
          return (resolved - submitted) / 1000 / 60 / 60;
        });
        averageResolutionTime = times.reduce((a, b) => a + b, 0) / times.length;
      }

      const { data: oldestPendingData } = await supabase
        .from("disputes")
        .select("submitted_at")
        .in("status", ["pending", "investigating"])
        .order("submitted_at", { ascending: true })
        .limit(1)
        .single();

      const totalAll =
        (totalPending || 0) +
        (totalInvestigating || 0) +
        (totalResolved || 0) +
        (totalEscalated || 0);
      const resolutionRate =
        totalAll > 0 ? ((totalResolved || 0) / totalAll) * 100 : 0;

      return {
        totalPending: totalPending || 0,
        totalInvestigating: totalInvestigating || 0,
        totalResolved: totalResolved || 0,
        totalEscalated: totalEscalated || 0,
        averageResolutionTime,
        oldestPending: oldestPendingData?.submitted_at || null,
        resolutionRate,
      };
    } catch (error) {
      console.error("Error fetching dispute stats:", error);
      return {
        totalPending: 0,
        totalInvestigating: 0,
        totalResolved: 0,
        totalEscalated: 0,
        averageResolutionTime: null,
        oldestPending: null,
        resolutionRate: 0,
      };
    }
  }

  /**
   * Get dispute by ID
   */
  static async getDisputeById(disputeId: string): Promise<Dispute | null> {
    const supabase = await createClient();

    try {
      const { data, error } = await supabase
        .from("disputes")
        .select("*")
        .eq("dispute_id", disputeId)
        .single();

      if (error) throw error;
      if (!data) return null;

      const disputes = await this.getDisputes({
        page: 1,
        limit: 1,
      });

      return disputes.disputes.find((d) => d.dispute_id === disputeId) || null;
    } catch (error) {
      console.error("Error fetching dispute by ID:", error);
      return null;
    }
  }

  /**
   * Resolve dispute
   */
  static async resolveDispute(
    disputeId: string,
    resolution: DisputeResolution,
    resolutionNotes: string,
    refundAmountCents?: number
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const updates: Record<string, unknown> = {
        status: "resolved",
        resolution,
        resolution_notes: resolutionNotes,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (refundAmountCents !== undefined) {
        updates.refund_amount_cents = refundAmountCents;
      }

      const { error } = await supabase
        .from("disputes")
        .update(updates)
        .eq("dispute_id", disputeId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Error resolving dispute:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la résolution du litige",
      };
    }
  }

  /**
   * Assign dispute to moderator
   */
  static async assignDispute(
    disputeId: string,
    moderatorId: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const { error } = await supabase
        .from("disputes")
        .update({
          assigned_to: moderatorId,
          status: "investigating",
          updated_at: new Date().toISOString(),
        })
        .eq("dispute_id", disputeId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Error assigning dispute:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'assignation du litige",
      };
    }
  }

  /**
   * Escalate dispute
   */
  static async escalateDispute(
    disputeId: string,
    escalationNotes: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const { error } = await supabase
        .from("disputes")
        .update({
          status: "escalated",
          priority: "urgent",
          resolution_notes: escalationNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("dispute_id", disputeId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Error escalating dispute:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'escalade du litige",
      };
    }
  }

  /**
   * Update dispute priority
   */
  static async updateDisputePriority(
    disputeId: string,
    priority: DisputePriority
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const { error } = await supabase
        .from("disputes")
        .update({
          priority,
          updated_at: new Date().toISOString(),
        })
        .eq("dispute_id", disputeId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Error updating dispute priority:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la mise à jour de la priorité",
      };
    }
  }
}
