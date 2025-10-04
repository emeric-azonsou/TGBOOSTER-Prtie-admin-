/**
 * Campaign Service - Professional service layer for campaign management
 * Handles all business logic for campaigns (tasks) and their executions
 */

import { createClient } from "@/lib/supabase/server";
import {
  formatCurrency,
  formatDate,
  formatTaskType,
  formatTaskStatus,
  formatTaskPriority,
} from "@/lib/utils/formatters";
import type {
  CampaignWithClient,
  CampaignListItem,
  CampaignDetails,
  CampaignExecution,
  CampaignStats,
  CampaignFilters,
  PaginatedCampaigns,
  CampaignFormData,
  CampaignUpdateData,
  ExecutionUpdateData,
  TaskType,
  TaskStatus,
  TaskPriority,
} from "@/types/campaign.types";

export class CampaignService {
  /**
   * Get paginated list of campaigns with filters
   */
  static async getCampaigns(
    filters: CampaignFilters = {}
  ): Promise<PaginatedCampaigns> {
    const supabase = await createClient();
    const {
      search = "",
      status = "all",
      type = "all",
      priority = "all",
      clientId,
      sortBy = "createdDate",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = filters;

    try {
      let query = supabase
        .from("tasks")
        .select(
          `
          *,
          client_profiles!tasks_client_id_fkey (
            client_id,
            company_name,
            user_profiles!client_profiles_client_id_fkey (
              id,
              first_name,
              last_name,
              email
            )
          )
        `,
          { count: "exact" }
        );

      if (status !== "all") {
        query = query.eq("status", status);
      }

      if (type !== "all") {
        query = query.eq("task_type", type);
      }

      if (priority !== "all") {
        query = query.eq("priority", priority);
      }

      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const sortColumn =
        sortBy === "title"
          ? "title"
          : sortBy === "budget"
            ? "total_budget_cents"
            : sortBy === "progress"
              ? "quantity_completed"
              : sortBy === "status"
                ? "status"
                : "created_at";

      query = query.order(sortColumn, { ascending: sortOrder === "asc" });

      const start = (page - 1) * limit;
      const end = start + limit - 1;
      query = query.range(start, end);

      const { data, error, count } = await query;

      if (error) throw error;

      const campaigns: CampaignListItem[] = (data || []).map((task) => {
        const clientProfile = Array.isArray(task.client_profiles)
          ? task.client_profiles[0]
          : task.client_profiles;

        const userProfile = clientProfile?.user_profiles;
        const user = Array.isArray(userProfile) ? userProfile[0] : userProfile;

        const clientName = user
          ? `${user.first_name} ${user.last_name}`
          : "Client inconnu";

        const spentCents =
          task.total_budget_cents - task.remaining_budget_cents;
        const progress =
          task.quantity_required > 0
            ? Math.round(
                (task.quantity_completed / task.quantity_required) * 100
              )
            : 0;

        return {
          id: task.task_id,
          title: task.title,
          clientName,
          clientId: task.client_id,
          type: this.formatTaskType(task.task_type),
          typeRaw: task.task_type,
          budget: this.formatCurrency(task.total_budget_cents),
          budgetCents: task.total_budget_cents,
          spent: this.formatCurrency(spentCents),
          spentCents,
          remaining: this.formatCurrency(task.remaining_budget_cents),
          remainingCents: task.remaining_budget_cents,
          quantityRequired: task.quantity_required,
          quantityCompleted: task.quantity_completed,
          progress,
          status: task.status,
          statusLabel: this.formatTaskStatus(task.status),
          priority: task.priority,
          priorityLabel: this.formatTaskPriority(task.priority),
          rewardPerAction: this.formatCurrency(task.reward_per_execution_cents),
          rewardPerActionCents: task.reward_per_execution_cents,
          startDate: this.formatDate(task.start_date),
          endDate: task.end_date ? this.formatDate(task.end_date) : null,
          createdDate: this.formatDate(task.created_at),
          estimatedDuration: task.estimated_duration_minutes,
        };
      });

      return {
        campaigns,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return {
        campaigns: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
    }
  }

  /**
   * Get campaign by ID with full details
   */
  static async getCampaignById(
    campaignId: string
  ): Promise<CampaignDetails | null> {
    const supabase = await createClient();

    try {
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("task_id", campaignId)
        .single();

      if (taskError || !task) {
        console.error("Error fetching campaign:", taskError);
        return null;
      }

      const { data: clientProfile, error: clientError } = await supabase
        .from("client_profiles")
        .select(
          `
          *,
          user_profiles!client_profiles_client_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `
        )
        .eq("client_id", task.client_id)
        .single();

      if (clientError) {
        console.error("Error fetching client:", clientError);
        return null;
      }

      const userProfile = Array.isArray(clientProfile.user_profiles)
        ? clientProfile.user_profiles[0]
        : clientProfile.user_profiles;

      const executions = await this.getCampaignExecutions(campaignId);
      const stats = await this.getCampaignStats(campaignId);

      const campaignWithClient: CampaignWithClient = {
        ...task,
        client: {
          id: userProfile.id,
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
          email: userProfile.email,
          company_name: clientProfile.company_name,
        },
      };

      return {
        ...campaignWithClient,
        executions,
        stats,
      };
    } catch (error) {
      console.error("Error fetching campaign details:", error);
      return null;
    }
  }

  /**
   * Get campaign executions
   */
  static async getCampaignExecutions(
    campaignId: string,
    limit = 50
  ): Promise<CampaignExecution[]> {
    const supabase = await createClient();

    try {
      const { data, error } = await supabase
        .from("task_executions")
        .select(
          `
          *,
          executant_profiles!task_executions_executant_id_fkey (
            executant_id,
            user_profiles!executant_profiles_executant_id_fkey (
              id,
              first_name,
              last_name,
              email
            )
          )
        `
        )
        .eq("task_id", campaignId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((execution) => {
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
          status: execution.status,
          assigned_at: execution.assigned_at,
          started_at: execution.started_at,
          submitted_at: execution.submitted_at,
          completed_at: execution.completed_at,
          reviewed_at: execution.reviewed_at,
          reviewer_id: execution.reviewer_id,
          proof_urls: execution.proof_urls,
          proof_screenshots: execution.proof_screenshots,
          executant_notes: execution.executant_notes,
          review_notes: execution.review_notes,
          rejection_reason: execution.rejection_reason,
          reward_cents: execution.reward_cents,
          bonus_cents: execution.bonus_cents,
          rating: execution.rating,
          metadata: execution.metadata,
          created_at: execution.created_at,
        };
      });
    } catch (error) {
      console.error("Error fetching campaign executions:", error);
      return [];
    }
  }

  /**
   * Get campaign statistics
   */
  static async getCampaignStats(
    campaignId: string
  ): Promise<CampaignStats> {
    const supabase = await createClient();

    try {
      const { data: executions } = await supabase
        .from("task_executions")
        .select("status, reward_cents, bonus_cents, rating, submitted_at, completed_at")
        .eq("task_id", campaignId);

      const totalExecutions = executions?.length || 0;
      const completedExecutions =
        executions?.filter((e) => e.status === "completed").length || 0;
      const pendingExecutions =
        executions?.filter((e) =>
          ["assigned", "in_progress", "submitted"].includes(e.status)
        ).length || 0;
      const rejectedExecutions =
        executions?.filter((e) => e.status === "rejected").length || 0;

      const totalSpent = executions
        ?.filter((e) => e.status === "completed")
        .reduce((sum, e) => sum + (e.reward_cents + (e.bonus_cents || 0)), 0) || 0;

      const completedWithTime = executions?.filter(
        (e) => e.submitted_at && e.completed_at
      ) || [];

      const averageCompletionTime = completedWithTime.length > 0
        ? completedWithTime.reduce((sum, e) => {
            const start = new Date(e.submitted_at!).getTime();
            const end = new Date(e.completed_at!).getTime();
            return sum + (end - start);
          }, 0) / completedWithTime.length / 1000 / 60
        : null;

      const successRate =
        totalExecutions > 0
          ? Math.round((completedExecutions / totalExecutions) * 100)
          : 0;

      const ratingsData = executions?.filter((e) => e.rating !== null) || [];
      const averageRating = ratingsData.length > 0
        ? ratingsData.reduce((sum, e) => sum + (e.rating || 0), 0) / ratingsData.length
        : 0;

      return {
        totalExecutions,
        completedExecutions,
        pendingExecutions,
        rejectedExecutions,
        totalSpent,
        totalSpentFormatted: this.formatCurrency(totalSpent),
        averageCompletionTime,
        successRate,
        averageRating: Math.round(averageRating * 10) / 10,
      };
    } catch (error) {
      console.error("Error fetching campaign stats:", error);
      return {
        totalExecutions: 0,
        completedExecutions: 0,
        pendingExecutions: 0,
        rejectedExecutions: 0,
        totalSpent: 0,
        totalSpentFormatted: "0 FCFA",
        averageCompletionTime: null,
        successRate: 0,
        averageRating: 0,
      };
    }
  }

  /**
   * Create a new campaign
   */
  static async createCampaign(
    clientId: string,
    formData: CampaignFormData
  ): Promise<{ success: boolean; campaignId?: string; error?: string }> {
    const supabase = await createClient();

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          client_id: clientId,
          title: formData.title,
          description: formData.description,
          task_type: formData.taskType,
          target_url: formData.targetUrl,
          target_username: formData.targetUsername || null,
          instructions: formData.instructions || null,
          proof_requirements: formData.proofRequirements || null,
          quantity_required: formData.quantityRequired,
          quantity_completed: 0,
          reward_per_execution_cents: formData.rewardPerExecutionCents,
          total_budget_cents: formData.totalBudgetCents,
          remaining_budget_cents: formData.totalBudgetCents,
          status: "draft",
          priority: formData.priority || "normal",
          start_date: formData.startDate || new Date().toISOString(),
          end_date: formData.endDate || null,
          target_audience: formData.targetAudience || null,
          geographic_restrictions: formData.geographicRestrictions || null,
          age_restrictions: formData.ageRestrictions || null,
          required_follower_count: formData.requiredFollowerCount || null,
          auto_approve: formData.autoApprove || false,
          max_executions_per_user: formData.maxExecutionsPerUser || 1,
          estimated_duration_minutes: formData.estimatedDurationMinutes || null,
          tags: formData.tags || null,
          metadata: {},
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, campaignId: data.task_id };
    } catch (error) {
      console.error("Error creating campaign:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur lors de la création de la campagne",
      };
    }
  }

  /**
   * Update campaign
   */
  static async updateCampaign(
    campaignId: string,
    updateData: CampaignUpdateData
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const updates: Record<string, unknown> = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("task_id", campaignId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Error updating campaign:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur lors de la mise à jour",
      };
    }
  }

  /**
   * Update campaign status
   */
  static async updateCampaignStatus(
    campaignId: string,
    status: TaskStatus
  ): Promise<{ success: boolean; error?: string }> {
    return this.updateCampaign(campaignId, { status });
  }

  /**
   * Delete campaign (soft delete by setting status to cancelled)
   */
  static async deleteCampaign(
    campaignId: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.updateCampaignStatus(campaignId, "cancelled");
  }

  /**
   * Update execution status and review
   */
  static async updateExecution(
    executionId: string,
    updateData: ExecutionUpdateData
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const updates: Record<string, unknown> = {
        status: updateData.status,
        updated_at: new Date().toISOString(),
      };

      if (updateData.status === "completed") {
        updates.completed_at = new Date().toISOString();
        updates.reviewed_at = new Date().toISOString();
      }

      if (updateData.reviewNotes) {
        updates.review_notes = updateData.reviewNotes;
      }

      if (updateData.rejectionReason) {
        updates.rejection_reason = updateData.rejectionReason;
      }

      if (updateData.rating) {
        updates.rating = updateData.rating;
      }

      if (updateData.bonusCents !== undefined) {
        updates.bonus_cents = updateData.bonusCents;
      }

      const { error } = await supabase
        .from("task_executions")
        .update(updates)
        .eq("execution_id", executionId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Error updating execution:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur lors de la mise à jour",
      };
    }
  }

  /**
   * Helper: Format task type to French
   */
  private static formatTaskType(type: TaskType): string {
    return formatTaskType(type);
  }

  /**
   * Helper: Format task status to French
   */
  private static formatTaskStatus(status: TaskStatus): string {
    return formatTaskStatus(status);
  }

  /**
   * Helper: Format task priority to French
   */
  private static formatTaskPriority(priority: TaskPriority): string {
    return formatTaskPriority(priority);
  }

  /**
   * Helper: Format currency (cents to FCFA)
   */
  private static formatCurrency(cents: number): string {
    return formatCurrency(cents);
  }

  /**
   * Helper: Format date
   */
  private static formatDate(date: string | Date): string {
    return formatDate(date);
  }
}
