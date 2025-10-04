/**
 * Admin Log Service
 * Handles all admin activity logging operations
 */

import { createClient } from "@/lib/supabase/server";
import type {
  AdminLog,
  AdminLogWithUser,
  LogFilters,
  PaginationParams,
  PaginatedResponse,
  CreateLogInput,
  ActivitySummary,
  SystemMetrics,
} from "@/types/system.types";

export class AdminLogService {
  /**
   * Get paginated admin logs with filters
   */
  static async getLogs(
    filters: LogFilters = {},
    pagination: PaginationParams = { page: 1, limit: 50 }
  ): Promise<PaginatedResponse<AdminLogWithUser>> {
    const supabase = await createClient();

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("Utilisateur non authentifié");
      }

      let query = supabase
        .from("admin_logs")
        .select(`
          id,
          admin_id,
          action,
          entity_type,
          entity_id,
          details,
          ip_address,
          user_agent,
          created_at,
          user_profiles!admin_logs_admin_id_fkey (
            first_name,
            last_name,
            email
          )
        `, { count: "exact" });

      if (filters.admin_id) {
        query = query.eq("admin_id", filters.admin_id);
      }

      if (filters.action) {
        query = query.eq("action", filters.action);
      }

      if (filters.entity_type) {
        query = query.eq("entity_type", filters.entity_type);
      }

      if (filters.date_from) {
        query = query.gte("created_at", filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte("created_at", filters.date_to);
      }

      if (filters.search) {
        query = query.or(
          `details->>description.ilike.%${filters.search}%,action.ilike.%${filters.search}%`
        );
      }

      const offset = (pagination.page - 1) * pagination.limit;
      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + pagination.limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      const logsWithUser: AdminLogWithUser[] = data?.map((log) => {
        const profile = Array.isArray(log.user_profiles)
          ? log.user_profiles[0]
          : log.user_profiles;

        return {
          id: log.id,
          admin_id: log.admin_id,
          action: log.action,
          entity_type: log.entity_type,
          entity_id: log.entity_id,
          details: log.details || {},
          ip_address: log.ip_address,
          user_agent: log.user_agent,
          created_at: log.created_at,
          admin_name: profile
            ? `${profile.first_name} ${profile.last_name}`
            : "Utilisateur inconnu",
          admin_email: profile?.email || "",
          admin_role: "global",
        };
      }) || [];

      return {
        data: logsWithUser,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / pagination.limit),
        },
      };
    } catch (error) {
      console.error("Error fetching admin logs:", error);
      throw error;
    }
  }

  /**
   * Create a new admin log entry
   */
  static async createLog(input: CreateLogInput): Promise<AdminLog> {
    const supabase = await createClient();

    try {
      const { data, error } = await supabase
        .from("admin_logs")
        .insert({
          admin_id: input.admin_id,
          action: input.action,
          entity_type: input.entity_type,
          entity_id: input.entity_id,
          details: input.details || {},
          ip_address: input.ip_address,
          user_agent: input.user_agent,
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error creating admin log:", error);
      throw error;
    }
  }

  /**
   * Get activity summary (grouped by action type)
   */
  static async getActivitySummary(days: number = 7): Promise<ActivitySummary[]> {
    const supabase = await createClient();

    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);

      const { data, error } = await supabase
        .from("admin_logs")
        .select("action, created_at")
        .gte("created_at", dateFrom.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      const summary = new Map<string, { count: number; lastOccurrence: string }>();

      data?.forEach((log) => {
        const existing = summary.get(log.action) || { count: 0, lastOccurrence: log.created_at };
        summary.set(log.action, {
          count: existing.count + 1,
          lastOccurrence: log.created_at > existing.lastOccurrence
            ? log.created_at
            : existing.lastOccurrence,
        });
      });

      return Array.from(summary.entries()).map(([action, data]) => ({
        action: action as ActivitySummary["action"],
        count: data.count,
        last_occurrence: data.lastOccurrence,
      }));
    } catch (error) {
      console.error("Error fetching activity summary:", error);
      return [];
    }
  }

  /**
   * Get system metrics
   */
  static async getSystemMetrics(): Promise<SystemMetrics> {
    const supabase = await createClient();

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [totalLogsResult, todayLogsResult, activeAdminsResult] = await Promise.all([
        supabase
          .from("admin_logs")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("admin_logs")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
        supabase
          .from("user_profiles")
          .select("*", { count: "exact", head: true })
          .eq("user_type", "admin")
          .eq("status", "active"),
      ]);

      return {
        total_logs: totalLogsResult.count || 0,
        logs_today: todayLogsResult.count || 0,
        active_admins: activeAdminsResult.count || 0,
        error_rate: 0,
        avg_response_time_ms: 0,
      };
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      throw error;
    }
  }

  /**
   * Get logs by entity (for audit trail)
   */
  static async getLogsByEntity(
    entityType: string,
    entityId: string
  ): Promise<AdminLogWithUser[]> {
    const supabase = await createClient();

    try {
      const { data, error } = await supabase
        .from("admin_logs")
        .select(`
          id,
          admin_id,
          action,
          entity_type,
          entity_id,
          details,
          ip_address,
          user_agent,
          created_at,
          user_profiles!admin_logs_admin_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data?.map((log) => {
        const profile = Array.isArray(log.user_profiles)
          ? log.user_profiles[0]
          : log.user_profiles;

        return {
          id: log.id,
          admin_id: log.admin_id,
          action: log.action,
          entity_type: log.entity_type,
          entity_id: log.entity_id,
          details: log.details || {},
          ip_address: log.ip_address,
          user_agent: log.user_agent,
          created_at: log.created_at,
          admin_name: profile
            ? `${profile.first_name} ${profile.last_name}`
            : "Utilisateur inconnu",
          admin_email: profile?.email || "",
          admin_role: "global",
        };
      }) || [];
    } catch (error) {
      console.error("Error fetching logs by entity:", error);
      return [];
    }
  }

  /**
   * Helper: Format relative time
   */
  static formatRelativeTime(date: string): string {
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

  /**
   * Helper: Format action to French
   */
  static formatAction(action: string): string {
    const actionMap: Record<string, string> = {
      user_created: "Création utilisateur",
      user_updated: "Modification utilisateur",
      user_suspended: "Suspension utilisateur",
      user_banned: "Bannissement utilisateur",
      task_validated: "Validation tâche",
      task_rejected: "Rejet tâche",
      task_created: "Création tâche",
      task_updated: "Modification tâche",
      dispute_created: "Création litige",
      dispute_resolved: "Résolution litige",
      withdrawal_approved: "Approbation retrait",
      withdrawal_rejected: "Rejet retrait",
      payment_processed: "Traitement paiement",
      system_config_updated: "Mise à jour configuration",
      admin_login: "Connexion admin",
      admin_logout: "Déconnexion admin",
    };
    return actionMap[action] || action;
  }
}
