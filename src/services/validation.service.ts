/**
 * Validation Service - Professional service layer for task validation
 * Handles validation workflow for task executions
 */

import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatRelativeTime, formatTaskType } from "@/lib/utils/formatters";
import type {
  PendingTaskExecution,
  ValidationFilters,
  PaginatedValidations,
  ValidationStats,
} from "@/types/validation.types";

export class ValidationService {
  /**
   * Get paginated list of pending task executions
   */
  static async getPendingTasks(
    filters: ValidationFilters = {}
  ): Promise<PaginatedValidations> {
    const supabase = await createClient();
    const {
      search = "",
      taskType = "all",
      campaignId,
      executantId,
      sortBy = "submittedDate",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = filters;

    try {
      let query = supabase
        .from("task_executions")
        .select(
          `
          execution_id,
          task_id,
          executant_id,
          submitted_at,
          proof_urls,
          proof_screenshots,
          executant_notes,
          reward_cents,
          status,
          tasks!task_executions_task_id_fkey (
            task_id,
            title,
            task_type,
            client_id
          ),
          executant_profiles!task_executions_executant_id_fkey (
            executant_id,
            user_profiles!executant_profiles_executant_id_fkey (
              id,
              first_name,
              last_name,
              email
            )
          )
        `,
          { count: "exact" }
        )
        .eq("status", "submitted");

      if (taskType !== "all") {
        query = query.eq("tasks.task_type", taskType);
      }

      if (campaignId) {
        query = query.eq("task_id", campaignId);
      }

      if (executantId) {
        query = query.eq("executant_id", executantId);
      }

      if (search) {
        query = query.or(
          `tasks.title.ilike.%${search}%,executant_profiles.user_profiles.first_name.ilike.%${search}%,executant_profiles.user_profiles.last_name.ilike.%${search}%`
        );
      }

      const sortColumn =
        sortBy === "submittedDate"
          ? "submitted_at"
          : sortBy === "amount"
            ? "reward_cents"
            : "submitted_at";

      query = query.order(sortColumn, { ascending: sortOrder === "asc" });

      const start = (page - 1) * limit;
      const end = start + limit - 1;
      query = query.range(start, end);

      const { data, error, count } = await query;

      if (error) throw error;

      const tasks: PendingTaskExecution[] = (data || []).map((execution) => {
        const task = Array.isArray(execution.tasks)
          ? execution.tasks[0]
          : execution.tasks;

        const executantProfile = Array.isArray(execution.executant_profiles)
          ? execution.executant_profiles[0]
          : execution.executant_profiles;

        const userProfile = executantProfile?.user_profiles;
        const user = Array.isArray(userProfile) ? userProfile[0] : userProfile;

        return {
          execution_id: execution.execution_id,
          task_id: execution.task_id,
          executant_id: execution.executant_id,
          executant_name: user
            ? `${user.first_name} ${user.last_name}`
            : "Utilisateur inconnu",
          executant_email: user?.email || "",
          campaign_id: task?.task_id || "",
          campaign_title: task?.title || "Campagne inconnue",
          task_type: task?.task_type || "social_follow",
          task_type_label: formatTaskType(task?.task_type || "social_follow"),
          submitted_at: execution.submitted_at || "",
          submitted_at_relative: execution.submitted_at
            ? formatRelativeTime(execution.submitted_at)
            : "",
          proof_urls: execution.proof_urls,
          proof_screenshots: execution.proof_screenshots,
          executant_notes: execution.executant_notes,
          reward_cents: execution.reward_cents,
          reward_formatted: formatCurrency(execution.reward_cents),
          status: execution.status,
        };
      });

      return {
        tasks,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error("Error fetching pending tasks:", error);
      return {
        tasks: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
    }
  }

  /**
   * Get validation statistics
   */
  static async getValidationStats(): Promise<ValidationStats> {
    const supabase = await createClient();

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        { count: pendingCount },
        { count: approvedToday },
        { count: rejectedToday },
      ] = await Promise.all([
        supabase
          .from("task_executions")
          .select("*", { count: "exact", head: true })
          .eq("status", "submitted"),
        supabase
          .from("task_executions")
          .select("*", { count: "exact", head: true })
          .eq("status", "completed")
          .gte("reviewed_at", today.toISOString()),
        supabase
          .from("task_executions")
          .select("*", { count: "exact", head: true })
          .eq("status", "rejected")
          .gte("reviewed_at", today.toISOString()),
      ]);

      const { data: processingTimes } = await supabase
        .from("task_executions")
        .select("submitted_at, reviewed_at")
        .eq("status", "completed")
        .not("submitted_at", "is", null)
        .not("reviewed_at", "is", null)
        .gte("reviewed_at", today.toISOString());

      let averageProcessingTime: number | null = null;
      if (processingTimes && processingTimes.length > 0) {
        const times = processingTimes.map((t) => {
          const submitted = new Date(t.submitted_at!).getTime();
          const reviewed = new Date(t.reviewed_at!).getTime();
          return (reviewed - submitted) / 1000 / 60;
        });
        averageProcessingTime =
          times.reduce((a, b) => a + b, 0) / times.length;
      }

      const { data: oldestPendingData } = await supabase
        .from("task_executions")
        .select("submitted_at")
        .eq("status", "submitted")
        .order("submitted_at", { ascending: true })
        .limit(1)
        .single();

      return {
        pendingCount: pendingCount || 0,
        approvedToday: approvedToday || 0,
        rejectedToday: rejectedToday || 0,
        averageProcessingTime,
        oldestPending: oldestPendingData?.submitted_at || null,
      };
    } catch (error) {
      console.error("Error fetching validation stats:", error);
      return {
        pendingCount: 0,
        approvedToday: 0,
        rejectedToday: 0,
        averageProcessingTime: null,
        oldestPending: null,
      };
    }
  }

  /**
   * Approve task execution
   */
  static async approveExecution(
    executionId: string,
    rating?: number,
    bonusCents?: number,
    reviewNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const updates: Record<string, unknown> = {
        status: "completed",
        completed_at: new Date().toISOString(),
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (rating) updates.rating = rating;
      if (bonusCents !== undefined) updates.bonus_cents = bonusCents;
      if (reviewNotes) updates.review_notes = reviewNotes;

      const { error } = await supabase
        .from("task_executions")
        .update(updates)
        .eq("execution_id", executionId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Error approving execution:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la validation",
      };
    }
  }

  /**
   * Reject task execution
   */
  static async rejectExecution(
    executionId: string,
    rejectionReason: string,
    reviewNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const updates: Record<string, unknown> = {
        status: "rejected",
        rejection_reason: rejectionReason,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (reviewNotes) updates.review_notes = reviewNotes;

      const { error } = await supabase
        .from("task_executions")
        .update(updates)
        .eq("execution_id", executionId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Error rejecting execution:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Erreur lors du rejet",
      };
    }
  }

  /**
   * Bulk approve executions
   */
  static async bulkApprove(
    executionIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const { error } = await supabase
        .from("task_executions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in("execution_id", executionIds);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Error bulk approving:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la validation en masse",
      };
    }
  }

  /**
   * Bulk reject executions
   */
  static async bulkReject(
    executionIds: string[],
    rejectionReason: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const { error } = await supabase
        .from("task_executions")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in("execution_id", executionIds);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Error bulk rejecting:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors du rejet en masse",
      };
    }
  }
}
