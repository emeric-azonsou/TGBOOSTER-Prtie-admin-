/**
 * Executant Service - Professional service layer for executant management
 * Handles all business logic for executants (task executors)
 */

import { createClient } from "@/lib/supabase/server";
import type {
  ExecutantWithProfile,
  ExecutantStats,
  ExecutantListItem,
  ExecutantTask,
  ExecutantFilters,
  PaginatedExecutants,
  VerificationLevel,
} from "@/types/executant.types";
import type { UserStatus } from "@/types/database.types";

export class ExecutantService {
  /**
   * Get paginated list of executants with filters
   */
  static async getExecutants(
    filters: ExecutantFilters = {}
  ): Promise<PaginatedExecutants> {
    const supabase = await createClient();
    const {
      search = "",
      status = "all",
      verified,
      subscriptionTier,
      sortBy = "joinedDate",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = filters;

    let query = supabase
      .from("user_profiles")
      .select(
        `
        id,
        first_name,
        last_name,
        email,
        phone,
        status,
        created_at,
        last_login_at,
        executant_profiles!inner (
          executant_id,
          is_verified,
          verification_level,
          subscription_plan_id,
          total_tasks_completed,
          rating_avg,
          success_rate,
          social_media_accounts
        )
      `,
        { count: "exact" }
      )
      .eq("user_type", "executant");

    // Status filter
    if (status !== "all") {
      query = query.eq("status", status);
    }

    // Verification filter
    if (verified !== undefined) {
      query = query.eq("executant_profiles.is_verified", verified);
    }

    // Subscription tier filter
    if (subscriptionTier) {
      query = query.eq(
        "executant_profiles.subscription_plan_id",
        subscriptionTier
      );
    }

    // Search filter
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    // Sorting
    const sortColumn =
      sortBy === "name"
        ? "first_name"
        : sortBy === "joinedDate"
          ? "created_at"
          : sortBy === "totalEarned"
            ? "executant_wallets.total_earned_cents"
            : sortBy === "tasks"
              ? "executant_profiles.total_tasks_completed"
              : sortBy === "rating"
                ? "executant_profiles.rating_avg"
                : "created_at";

    query = query.order(sortColumn, { ascending: sortOrder === "asc" });

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching executants:", error.message || error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return {
        executants: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const executants: ExecutantListItem[] = (data || []).map((item) => {
      const profile = item.executant_profiles?.[0];
      const tiktokHandle =
        (profile?.social_media_accounts as Record<string, unknown>)?.tiktok as
          | { username?: string }
          | undefined;

      return {
        id: item.id,
        name: `${item.first_name} ${item.last_name}`,
        email: item.email,
        phone: item.phone,
        tiktokHandle: tiktokHandle?.username || null,
        totalTasks: profile?.total_tasks_completed || 0,
        totalEarned: "0 FCFA",
        successRate: profile?.success_rate || 0,
        rating: profile?.rating_avg || 0,
        status: item.status as
          | "pending_verification"
          | "active"
          | "suspended"
          | "banned",
        isVerified: profile?.is_verified || false,
        subscriptionTier: profile?.subscription_plan_id || null,
        joinedDate: this.formatDate(item.created_at),
        lastLogin: item.last_login_at
          ? this.formatDate(item.last_login_at)
          : null,
      };
    });

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      executants,
      total: count || 0,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get executant by ID with full profile
   */
  static async getExecutantById(
    executantId: string
  ): Promise<ExecutantWithProfile | null> {
    const supabase = await createClient();

    // Fetch user profile
    const { data: userData, error: userError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", executantId)
      .eq("user_type", "executant")
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError);
      return null;
    }

    // Fetch executant profile
    const { data: profileData, error: profileError } = await supabase
      .from("executant_profiles")
      .select("*")
      .eq("executant_id", executantId)
      .single();

    if (profileError || !profileData) {
      console.error("Error fetching executant profile:", profileError);
      return null;
    }

    // Fetch wallet
    const { data: walletData } = await supabase
      .from("executant_wallets")
      .select("*")
      .eq("executant_id", executantId)
      .single();

    return {
      user: userData,
      profile: profileData,
      wallet: walletData || undefined,
    };
  }

  /**
   * Get executant statistics
   */
  static async getExecutantStats(
    executantId: string
  ): Promise<ExecutantStats | null> {
    const executant = await this.getExecutantById(executantId);
    if (!executant || !executant.profile) return null;

    const { profile, wallet } = executant;

    // Calculate subscription status
    const now = new Date();
    const expiresAt = profile?.subscription_expires_at
      ? new Date(profile.subscription_expires_at)
      : null;

    let subscriptionStatus: "active" | "expired" | "none" = "none";
    if (expiresAt) {
      subscriptionStatus = expiresAt > now ? "active" : "expired";
    }

    return {
      totalTasksCompleted: profile.total_tasks_completed || 0,
      totalEarned: wallet?.total_earned_cents || 0,
      totalEarnedFormatted: this.formatCurrency(
        wallet?.total_earned_cents || 0
      ),
      accountBalance: wallet?.balance_cents || 0,
      accountBalanceFormatted: this.formatCurrency(wallet?.balance_cents || 0),
      pendingBalance: wallet?.pending_cents || 0,
      pendingBalanceFormatted: this.formatCurrency(wallet?.pending_cents || 0),
      successRate: profile.success_rate || 0,
      averageRating: profile.rating_avg || 0,
      activeTasks: await this.getActiveTasksCount(executantId),
      memberSince: this.formatDate(executant.user.created_at),
      lastActive: executant.user.last_login_at
        ? this.formatDate(executant.user.last_login_at)
        : null,
      subscriptionStatus,
      subscriptionExpiry: expiresAt ? this.formatDate(expiresAt.toISOString()) : null,
    };
  }

  /**
   * Get recent task executions for executant
   */
  static async getExecutantTasks(
    executantId: string,
    limit = 10
  ): Promise<ExecutantTask[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("task_executions")
      .select(
        `
        execution_id,
        status,
        submitted_at,
        completed_at,
        rejection_reason,
        reward_cents,
        tasks!inner (
          task_id,
          title,
          task_type
        )
      `
      )
      .eq("executant_id", executantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.error("Error fetching executant tasks:", error);
      return [];
    }

    return data.map((item) => {
      const task = item.tasks as unknown as {
        task_id: string;
        title: string;
        task_type: string;
      };

      return {
        id: item.execution_id,
        campaignTitle: task.title,
        campaignId: task.task_id,
        taskType: task.task_type,
        amount: this.formatCurrency(item.reward_cents || 0),
        status: item.status as
          | "assigned"
          | "in_progress"
          | "submitted"
          | "completed"
          | "rejected",
        submittedAt: item.submitted_at
          ? this.formatDate(item.submitted_at)
          : null,
        completedAt: item.completed_at
          ? this.formatDate(item.completed_at)
          : null,
        rejectionReason: item.rejection_reason,
      };
    });
  }

  /**
   * Update executant status (suspend/activate/ban)
   */
  static async updateExecutantStatus(
    executantId: string,
    status: UserStatus
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("user_profiles")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", executantId)
      .eq("user_type", "executant");

    if (error) {
      console.error("Error updating executant status:", error);
      throw error;
    }
  }

  /**
   * Verify executant identity
   */
  static async verifyExecutant(
    executantId: string,
    verificationLevel: VerificationLevel
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("executant_profiles")
      .update({
        is_verified: true,
        verification_level: verificationLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("executant_id", executantId);

    if (error) {
      console.error("Error verifying executant:", error);
      throw error;
    }
  }

  /**
   * Delete executant (soft delete)
   */
  static async deleteExecutant(executantId: string): Promise<void> {
    await this.updateExecutantStatus(executantId, "banned");
  }

  /**
   * Helper: Get count of active tasks
   */
  private static async getActiveTasksCount(
    executantId: string
  ): Promise<number> {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("task_executions")
      .select("*", { count: "exact", head: true })
      .eq("executant_id", executantId)
      .in("status", ["assigned", "in_progress", "submitted"]);

    if (error) {
      console.error("Error counting active tasks:", error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Helper: Format currency (cents to FCFA)
   */
  private static formatCurrency(cents: number): string {
    const fcfa = cents / 100;
    return new Intl.NumberFormat("fr-BJ", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(fcfa);
  }

  /**
   * Helper: Format date
   */
  private static formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  }
}
