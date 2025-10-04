/**
 * Dashboard Service
 * Handles all dashboard statistics and metrics retrieval
 */

import { createClient } from "@/lib/supabase/server";
import type { DashboardStats, RecentTask, RevenueData } from "@/types/dashboard.types";

export class DashboardService {
  /**
   * Get main dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createClient();

    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Authentication error:", authError);
        return {
          activeCampaigns: 0,
          activeCampaignsTrend: 0,
          tasksCompleted: 0,
          tasksCompletedTrend: 0,
          pendingValidations: 0,
          totalRevenue: 0,
          totalRevenueTrend: 0,
        };
      }

      // Get active campaigns count
      const { count: activeCampaigns } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Get completed tasks count (today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: tasksCompleted } = await supabase
        .from("task_executions")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("completed_at", today.toISOString());

      // Get pending validations count
      const { count: pendingValidations } = await supabase
        .from("task_executions")
        .select("*", { count: "exact", head: true })
        .eq("status", "submitted");

      // Calculate total revenue (sum of all completed task executions)
      const { data: revenueData } = await supabase
        .from("task_executions")
        .select("reward_cents")
        .eq("status", "completed");

      const totalRevenue = revenueData?.reduce((sum, item) => sum + (item.reward_cents || 0), 0) || 0;

      // Calculate trends (compare with previous period)
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const { count: yesterdayTasks } = await supabase
        .from("task_executions")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("completed_at", yesterday.toISOString())
        .lt("completed_at", today.toISOString());

      const tasksCompletedTrend = yesterdayTasks ?
        ((tasksCompleted! - yesterdayTasks) / yesterdayTasks) * 100 : 0;

      return {
        activeCampaigns: activeCampaigns || 0,
        activeCampaignsTrend: 12, // Mock for now
        tasksCompleted: tasksCompleted || 0,
        tasksCompletedTrend: Math.round(tasksCompletedTrend * 10) / 10,
        pendingValidations: pendingValidations || 0,
        totalRevenue,
        totalRevenueTrend: 18, // Mock for now
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  /**
   * Get detailed financial statistics for admin
   */
  static async getFinancialStats() {
    const supabase = await createClient();

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Total revenue from all completed tasks
      const { data: allRevenue } = await supabase
        .from("task_executions")
        .select("reward_cents, bonus_cents")
        .eq("status", "completed");

      const totalPayouts = allRevenue?.reduce(
        (sum, item) => sum + (item.reward_cents || 0) + (item.bonus_cents || 0),
        0
      ) || 0;

      // Revenue this month
      const { data: monthRevenue } = await supabase
        .from("task_executions")
        .select("reward_cents, bonus_cents")
        .eq("status", "completed")
        .gte("completed_at", firstDayOfMonth.toISOString());

      const monthlyPayouts = monthRevenue?.reduce(
        (sum, item) => sum + (item.reward_cents || 0) + (item.bonus_cents || 0),
        0
      ) || 0;

      // Total client deposits (budgets from tasks)
      const { data: taskBudgets } = await supabase
        .from("tasks")
        .select("total_budget_cents");

      const totalDeposits = taskBudgets?.reduce(
        (sum, item) => sum + (item.total_budget_cents || 0),
        0
      ) || 0;

      // Platform profit (deposits - payouts - assuming 30% commission)
      const platformProfit = totalDeposits - totalPayouts;

      // Pending withdrawals
      const { data: pendingWithdrawals } = await supabase
        .from("withdrawal_requests")
        .select("amount_cents")
        .eq("status", "pending");

      const pendingWithdrawalAmount = pendingWithdrawals?.reduce(
        (sum, item) => sum + (item.amount_cents || 0),
        0
      ) || 0;

      // Active users counts
      const { count: activeClients } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .eq("user_type", "client")
        .eq("status", "active");

      const { count: activeExecutants } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .eq("user_type", "executant")
        .eq("status", "active");

      return {
        totalDeposits,
        totalPayouts,
        platformProfit,
        monthlyPayouts,
        pendingWithdrawalAmount,
        activeClients: activeClients || 0,
        activeExecutants: activeExecutants || 0,
      };
    } catch (error) {
      console.error("Error fetching financial stats:", error);
      return {
        totalDeposits: 0,
        totalPayouts: 0,
        platformProfit: 0,
        monthlyPayouts: 0,
        pendingWithdrawalAmount: 0,
        activeClients: 0,
        activeExecutants: 0,
      };
    }
  }

  /**
   * Get recent tasks for dashboard
   */
  static async getRecentTasks(limit: number = 10): Promise<RecentTask[]> {
    const supabase = await createClient();

    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Authentication error:", authError);
        return [];
      }

      const { data, error } = await supabase
        .from("task_executions")
        .select(`
          execution_id,
          status,
          reward_cents,
          submitted_at,
          task_id,
          executant_id,
          tasks (
            title,
            task_type
          )
        `)
        .order("submitted_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // For now, use executant_id as name since we need to properly join user_profiles later
      return data?.map((item) => {
        const task = Array.isArray(item.tasks) ? item.tasks[0] : item.tasks;
        return {
          id: item.execution_id,
          executant: `Exécutant ${item.executant_id.substring(0, 8)}`,
          executantId: item.executant_id,
          campaign: task?.title || 'N/A',
          campaignId: item.task_id,
          type: task?.task_type || 'N/A',
          amount: item.reward_cents || 0,
          status: this.mapExecutionStatus(item.status),
          date: this.formatRelativeTime(item.submitted_at),
          submittedAt: item.submitted_at,
        };
      }) || [];
    } catch (error) {
      console.error("Error fetching recent tasks:", error);
      return [];
    }
  }

  /**
   * Get revenue data for chart (last 7 days)
   */
  static async getRevenueData(): Promise<RevenueData[]> {
    const supabase = await createClient();

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("task_executions")
        .select("completed_at, reward_cents")
        .eq("status", "completed")
        .gte("completed_at", sevenDaysAgo.toISOString())
        .order("completed_at", { ascending: true });

      if (error) throw error;

      // Group by date
      const groupedData = new Map<string, { revenue: number; count: number }>();

      data?.forEach((item) => {
        const date = new Date(item.completed_at).toISOString().split('T')[0];
        const existing = groupedData.get(date) || { revenue: 0, count: 0 };
        groupedData.set(date, {
          revenue: existing.revenue + (item.reward_cents || 0),
          count: existing.count + 1,
        });
      });

      // Convert to array
      return Array.from(groupedData.entries()).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        tasksCompleted: data.count,
      }));
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      return [];
    }
  }

  /**
   * Helper: Map execution status to French display status
   */
  private static mapExecutionStatus(status: string): "Validé" | "En attente" | "Rejeté" {
    const statusMap: Record<string, "Validé" | "En attente" | "Rejeté"> = {
      completed: "Validé",
      submitted: "En attente",
      in_progress: "En attente",
      rejected: "Rejeté",
    };
    return statusMap[status] || "En attente";
  }

  /**
   * Helper: Format relative time
   */
  private static formatRelativeTime(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "Il y a moins d'une minute";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  }
}
