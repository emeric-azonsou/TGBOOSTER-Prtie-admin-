/**
 * Validation History Service
 * Professional service layer for validation history tracking
 */

import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatRelativeTime, formatTaskType } from "@/lib/utils/formatters";
import type {
  ValidationHistoryRecord,
  ValidationHistoryFilters,
  PaginatedValidationHistory,
  ValidationHistorySummary,
  ValidationHistoryStats,
} from "@/types/validation-history.types";
import type { TaskType } from "@/types/database.types";

export class ValidationHistoryService {
  /**
   * Get paginated validation history
   */
  static async getValidationHistory(
    filters: ValidationHistoryFilters = {}
  ): Promise<PaginatedValidationHistory> {
    const supabase = await createClient();
    const {
      search = "",
      decision = "all",
      taskType = "all",
      campaignId,
      executantId,
      reviewerId,
      dateFrom,
      dateTo,
      sortBy = "reviewedDate",
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
          reviewed_at,
          reviewer_id,
          proof_urls,
          proof_screenshots,
          executant_notes,
          review_notes,
          rejection_reason,
          reward_cents,
          bonus_cents,
          rating,
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
        .in("status", ["completed", "rejected"])
        .not("reviewed_at", "is", null);

      if (decision !== "all") {
        const statusFilter = decision === "approved" ? "completed" : "rejected";
        query = query.eq("status", statusFilter);
      }

      if (taskType !== "all") {
        query = query.eq("tasks.task_type", taskType);
      }

      if (campaignId) {
        query = query.eq("task_id", campaignId);
      }

      if (executantId) {
        query = query.eq("executant_id", executantId);
      }

      if (reviewerId) {
        query = query.eq("reviewer_id", reviewerId);
      }

      if (dateFrom) {
        query = query.gte("reviewed_at", dateFrom);
      }

      if (dateTo) {
        query = query.lte("reviewed_at", dateTo);
      }

      if (search) {
        query = query.or(
          `tasks.title.ilike.%${search}%,executant_profiles.user_profiles.first_name.ilike.%${search}%,executant_profiles.user_profiles.last_name.ilike.%${search}%`
        );
      }

      const sortColumn =
        sortBy === "reviewedDate"
          ? "reviewed_at"
          : sortBy === "submittedDate"
            ? "submitted_at"
            : sortBy === "amount"
              ? "reward_cents"
              : "reviewed_at";

      query = query.order(sortColumn, { ascending: sortOrder === "asc" });

      const start = (page - 1) * limit;
      const end = start + limit - 1;
      query = query.range(start, end);

      const { data, error, count } = await query;

      if (error) throw error;

      const reviewerIds = [...new Set(data?.map((e) => e.reviewer_id).filter(Boolean) || [])];
      const reviewersMap = new Map<string, string>();

      if (reviewerIds.length > 0) {
        const { data: reviewersData } = await supabase
          .from("user_profiles")
          .select("id, first_name, last_name")
          .in("id", reviewerIds);

        reviewersData?.forEach((reviewer) => {
          reviewersMap.set(reviewer.id, `${reviewer.first_name} ${reviewer.last_name}`);
        });
      }

      const records: ValidationHistoryRecord[] = (data || []).map((execution) => {
        const task = Array.isArray(execution.tasks)
          ? execution.tasks[0]
          : execution.tasks;

        const executantProfile = Array.isArray(execution.executant_profiles)
          ? execution.executant_profiles[0]
          : execution.executant_profiles;

        const userProfile = executantProfile?.user_profiles;
        const user = Array.isArray(userProfile) ? userProfile[0] : userProfile;

        const reviewerName = execution.reviewer_id
          ? reviewersMap.get(execution.reviewer_id) || "Admin"
          : "Admin";

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
          reviewer_id: execution.reviewer_id || "",
          reviewer_name: reviewerName,
          decision: execution.status === "completed" ? "approved" : "rejected",
          reviewed_at: execution.reviewed_at || "",
          reviewed_at_relative: execution.reviewed_at
            ? formatRelativeTime(execution.reviewed_at)
            : "",
          submitted_at: execution.submitted_at || "",
          reward_cents: execution.reward_cents,
          reward_formatted: formatCurrency(execution.reward_cents),
          bonus_cents: execution.bonus_cents || 0,
          bonus_formatted: execution.bonus_cents
            ? formatCurrency(execution.bonus_cents)
            : null,
          rating: execution.rating,
          rejection_reason: execution.rejection_reason,
          review_notes: execution.review_notes,
          proof_urls: execution.proof_urls,
          proof_screenshots: execution.proof_screenshots,
          executant_notes: execution.executant_notes,
        };
      });

      const summary = await this.getValidationSummary(filters);

      return {
        records,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        summary,
      };
    } catch (error) {
      console.error("Error fetching validation history:", error);
      return {
        records: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        summary: {
          totalValidations: 0,
          totalApproved: 0,
          totalRejected: 0,
          approvalRate: 0,
          totalRewardPaid: 0,
          totalBonusPaid: 0,
          averageRating: null,
          topRejectionReasons: [],
        },
      };
    }
  }

  /**
   * Get validation summary statistics
   */
  static async getValidationSummary(
    filters: ValidationHistoryFilters = {}
  ): Promise<ValidationHistorySummary> {
    const supabase = await createClient();
    const { dateFrom, dateTo, taskType, campaignId, executantId, reviewerId } =
      filters;

    try {
      let query = supabase
        .from("task_executions")
        .select(
          "execution_id, status, reward_cents, bonus_cents, rating, rejection_reason",
          { count: "exact" }
        )
        .in("status", ["completed", "rejected"])
        .not("reviewed_at", "is", null);

      if (taskType && taskType !== "all") {
        query = query.eq("tasks.task_type", taskType);
      }

      if (campaignId) {
        query = query.eq("task_id", campaignId);
      }

      if (executantId) {
        query = query.eq("executant_id", executantId);
      }

      if (reviewerId) {
        query = query.eq("reviewer_id", reviewerId);
      }

      if (dateFrom) {
        query = query.gte("reviewed_at", dateFrom);
      }

      if (dateTo) {
        query = query.lte("reviewed_at", dateTo);
      }

      const { data, count } = await query;

      const totalValidations = count || 0;
      const totalApproved =
        data?.filter((r) => r.status === "completed").length || 0;
      const totalRejected =
        data?.filter((r) => r.status === "rejected").length || 0;
      const approvalRate =
        totalValidations > 0 ? (totalApproved / totalValidations) * 100 : 0;

      const totalRewardPaid =
        data
          ?.filter((r) => r.status === "completed")
          .reduce((sum, r) => sum + r.reward_cents, 0) || 0;

      const totalBonusPaid =
        data
          ?.filter((r) => r.status === "completed")
          .reduce((sum, r) => sum + (r.bonus_cents || 0), 0) || 0;

      const ratings = data?.filter((r) => r.rating !== null).map((r) => r.rating!);
      const averageRating =
        ratings && ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : null;

      const rejectionReasonCounts: Record<string, number> = {};
      data
        ?.filter((r) => r.status === "rejected" && r.rejection_reason)
        .forEach((r) => {
          const reason = r.rejection_reason!;
          rejectionReasonCounts[reason] =
            (rejectionReasonCounts[reason] || 0) + 1;
        });

      const topRejectionReasons = Object.entries(rejectionReasonCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([reason, count]) => ({ reason, count }));

      return {
        totalValidations,
        totalApproved,
        totalRejected,
        approvalRate,
        totalRewardPaid,
        totalBonusPaid,
        averageRating,
        topRejectionReasons,
      };
    } catch (error) {
      console.error("Error fetching validation summary:", error);
      return {
        totalValidations: 0,
        totalApproved: 0,
        totalRejected: 0,
        approvalRate: 0,
        totalRewardPaid: 0,
        totalBonusPaid: 0,
        averageRating: null,
        topRejectionReasons: [],
      };
    }
  }

  /**
   * Get detailed validation statistics
   */
  static async getValidationStats(
    dateFrom?: string,
    dateTo?: string
  ): Promise<ValidationHistoryStats> {
    const supabase = await createClient();

    try {
      let query = supabase
        .from("task_executions")
        .select(
          `
          execution_id,
          status,
          reviewed_at,
          submitted_at,
          reviewer_id,
          tasks!task_executions_task_id_fkey (
            task_type
          )
        `
        )
        .in("status", ["completed", "rejected"])
        .not("reviewed_at", "is", null);

      if (dateFrom) {
        query = query.gte("reviewed_at", dateFrom);
      }

      if (dateTo) {
        query = query.lte("reviewed_at", dateTo);
      }

      const { data } = await query;

      const byDate = this.aggregateByDate(data || []);
      const byTaskType = this.aggregateByTaskType(data || []);
      const byReviewer = await this.aggregateByReviewer(data || [], supabase);

      return {
        byDate,
        byTaskType,
        byReviewer,
      };
    } catch (error) {
      console.error("Error fetching validation stats:", error);
      return {
        byDate: [],
        byTaskType: [],
        byReviewer: [],
      };
    }
  }

  private static aggregateByDate(
    data: Array<{ reviewed_at: string; status: string }>
  ): Array<{ date: string; approved: number; rejected: number }> {
    const dateMap: Record<
      string,
      { date: string; approved: number; rejected: number }
    > = {};

    data.forEach((record) => {
      const date = new Date(record.reviewed_at).toISOString().split("T")[0];
      if (!dateMap[date]) {
        dateMap[date] = { date, approved: 0, rejected: 0 };
      }
      if (record.status === "completed") {
        dateMap[date].approved++;
      } else {
        dateMap[date].rejected++;
      }
    });

    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }

  private static aggregateByTaskType(
    data: Array<{ tasks: Array<{ task_type: TaskType }> | { task_type: TaskType }; status: string }>
  ): Array<{
    taskType: TaskType;
    approved: number;
    rejected: number;
    approvalRate: number;
  }> {
    const typeMap: Partial<Record<TaskType, { approved: number; rejected: number }>> = {};

    data.forEach((record) => {
      const task = Array.isArray(record.tasks)
        ? record.tasks[0]
        : record.tasks;
      const taskType = task?.task_type;

      if (!taskType) return;

      if (!typeMap[taskType]) {
        typeMap[taskType] = { approved: 0, rejected: 0 };
      }

      if (record.status === "completed") {
        typeMap[taskType]!.approved++;
      } else {
        typeMap[taskType]!.rejected++;
      }
    });

    return Object.entries(typeMap).map(([taskType, stats]) => ({
      taskType: taskType as TaskType,
      approved: stats!.approved,
      rejected: stats!.rejected,
      approvalRate:
        stats!.approved + stats!.rejected > 0
          ? (stats!.approved / (stats!.approved + stats!.rejected)) * 100
          : 0,
    }));
  }

  private static async aggregateByReviewer(
    data: Array<{
      reviewer_id: string | null;
      submitted_at: string;
      reviewed_at: string;
      status: string;
    }>,
    supabase: Awaited<ReturnType<typeof createClient>>
  ): Promise<
    Array<{
      reviewerId: string;
      reviewerName: string;
      totalReviews: number;
      approvalRate: number;
      averageProcessingTime: number;
    }>
  > {
    const reviewerMap: Record<
      string,
      {
        approved: number;
        rejected: number;
        processingTimes: number[];
      }
    > = {};

    data.forEach((record) => {
      if (!record.reviewer_id) return;

      if (!reviewerMap[record.reviewer_id]) {
        reviewerMap[record.reviewer_id] = {
          approved: 0,
          rejected: 0,
          processingTimes: [],
        };
      }

      if (record.status === "completed") {
        reviewerMap[record.reviewer_id].approved++;
      } else {
        reviewerMap[record.reviewer_id].rejected++;
      }

      if (record.submitted_at && record.reviewed_at) {
        const submitted = new Date(record.submitted_at).getTime();
        const reviewed = new Date(record.reviewed_at).getTime();
        const processingTime = (reviewed - submitted) / 1000 / 60;
        reviewerMap[record.reviewer_id].processingTimes.push(processingTime);
      }
    });

    const result = await Promise.all(
      Object.entries(reviewerMap).map(async ([reviewerId, stats]) => {
        const { data: reviewerData } = await supabase
          .from("user_profiles")
          .select("first_name, last_name")
          .eq("id", reviewerId)
          .single();

        const reviewerName = reviewerData
          ? `${reviewerData.first_name} ${reviewerData.last_name}`
          : "Admin";

        const totalReviews = stats.approved + stats.rejected;
        const approvalRate =
          totalReviews > 0 ? (stats.approved / totalReviews) * 100 : 0;
        const averageProcessingTime =
          stats.processingTimes.length > 0
            ? stats.processingTimes.reduce((a, b) => a + b, 0) /
              stats.processingTimes.length
            : 0;

        return {
          reviewerId,
          reviewerName,
          totalReviews,
          approvalRate,
          averageProcessingTime,
        };
      })
    );

    return result.sort((a, b) => b.totalReviews - a.totalReviews);
  }

  /**
   * Export validation history to CSV
   */
  static async exportToCSV(
    filters: ValidationHistoryFilters = {}
  ): Promise<string> {
    const { records } = await this.getValidationHistory({
      ...filters,
      limit: 10000,
    });

    const headers = [
      "Date validation",
      "Exécutant",
      "Campagne",
      "Type",
      "Décision",
      "Validé par",
      "Montant",
      "Bonus",
      "Note",
      "Raison rejet",
    ];

    const rows = records.map((record) => [
      new Date(record.reviewed_at).toLocaleString("fr-FR"),
      record.executant_name,
      record.campaign_title,
      record.task_type_label,
      record.decision === "approved" ? "Approuvé" : "Rejeté",
      record.reviewer_name,
      record.reward_formatted,
      record.bonus_formatted || "0 FCFA",
      record.rating?.toString() || "-",
      record.rejection_reason || "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return csvContent;
  }
}
