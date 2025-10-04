/**
 * Sanction Service
 * Professional service layer for user sanctions management
 */

import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/utils/formatters";
import type {
  Sanction,
  SanctionFilters,
  PaginatedSanctions,
  SanctionStats,
  SanctionType,
} from "@/types/dispute.types";

export class SanctionService {
  /**
   * Get paginated sanctions
   */
  static async getSanctions(
    filters: SanctionFilters = {}
  ): Promise<PaginatedSanctions> {
    const supabase = await createClient();
    const {
      search = "",
      sanctionType = "all",
      userType = "all",
      status = "all",
      appliedBy,
      dateFrom,
      dateTo,
      sortBy = "appliedDate",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = filters;

    try {
      let query = supabase
        .from("sanctions")
        .select("*", { count: "exact" });

      if (sanctionType !== "all") {
        query = query.eq("sanction_type", sanctionType);
      }

      if (userType !== "all") {
        query = query.eq("user_type", userType);
      }

      if (status !== "all") {
        query = query.eq("status", status);
      }

      if (appliedBy) {
        query = query.eq("applied_by", appliedBy);
      }

      if (dateFrom) {
        query = query.gte("applied_at", dateFrom);
      }

      if (dateTo) {
        query = query.lte("applied_at", dateTo);
      }

      if (search) {
        query = query.or(`reason.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const sortColumn =
        sortBy === "appliedDate"
          ? "applied_at"
          : sortBy === "expiryDate"
            ? "expires_at"
            : "applied_at";

      query = query.order(sortColumn, { ascending: sortOrder === "asc" });

      const start = (page - 1) * limit;
      const end = start + limit - 1;
      query = query.range(start, end);

      const { data, error, count } = await query;

      if (error) throw error;

      const sanctions: Sanction[] = await Promise.all(
        (data || []).map(async (sanction) => {
          let userName = "Utilisateur inconnu";
          let userEmail = "";
          let moderatorName = "Admin";

          const { data: userProfile } = await supabase
            .from("user_profiles")
            .select("first_name, last_name, email")
            .eq("id", sanction.user_id)
            .single();

          if (userProfile) {
            userName = `${userProfile.first_name} ${userProfile.last_name}`;
            userEmail = userProfile.email;
          }

          if (sanction.applied_by) {
            const { data: moderator } = await supabase
              .from("user_profiles")
              .select("first_name, last_name")
              .eq("id", sanction.applied_by)
              .single();

            if (moderator) {
              moderatorName = `${moderator.first_name} ${moderator.last_name}`;
            }
          }

          return {
            sanction_id: sanction.sanction_id,
            user_id: sanction.user_id,
            user_name: userName,
            user_email: userEmail,
            user_type: sanction.user_type,
            sanction_type: sanction.sanction_type,
            sanction_type_label: this.getSanctionTypeLabel(sanction.sanction_type),
            reason: sanction.reason,
            description: sanction.description,
            applied_by: sanction.applied_by,
            moderator_name: moderatorName,
            applied_at: sanction.applied_at,
            applied_at_relative: formatRelativeTime(sanction.applied_at),
            expires_at: sanction.expires_at,
            expires_at_relative: sanction.expires_at
              ? formatRelativeTime(sanction.expires_at)
              : null,
            revoked_at: sanction.revoked_at,
            revoked_by: sanction.revoked_by,
            revoke_reason: sanction.revoke_reason,
            status: sanction.status,
            related_dispute_id: sanction.related_dispute_id,
            metadata: sanction.metadata,
          };
        })
      );

      const stats = await this.getSanctionStats();

      return {
        sanctions,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        stats,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching sanctions (table may not exist):", errorMessage);
      return {
        sanctions: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        stats: {
          totalActive: 0,
          totalExpired: 0,
          totalRevoked: 0,
          warningsCount: 0,
          suspensionsCount: 0,
          bansCount: 0,
        },
      };
    }
  }

  /**
   * Get sanction statistics
   */
  static async getSanctionStats(): Promise<SanctionStats> {
    const supabase = await createClient();

    try {
      const { count: totalActive } = await supabase
        .from("sanctions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const { count: totalExpired } = await supabase
        .from("sanctions")
        .select("*", { count: "exact", head: true })
        .eq("status", "expired");

      const { count: totalRevoked } = await supabase
        .from("sanctions")
        .select("*", { count: "exact", head: true })
        .eq("status", "revoked");

      const { count: warningsCount } = await supabase
        .from("sanctions")
        .select("*", { count: "exact", head: true })
        .eq("sanction_type", "warning")
        .eq("status", "active");

      const { count: suspensionsCount } = await supabase
        .from("sanctions")
        .select("*", { count: "exact", head: true })
        .eq("sanction_type", "temporary_suspension")
        .eq("status", "active");

      const { count: bansCount } = await supabase
        .from("sanctions")
        .select("*", { count: "exact", head: true })
        .eq("sanction_type", "permanent_ban")
        .eq("status", "active");

      return {
        totalActive: totalActive || 0,
        totalExpired: totalExpired || 0,
        totalRevoked: totalRevoked || 0,
        warningsCount: warningsCount || 0,
        suspensionsCount: suspensionsCount || 0,
        bansCount: bansCount || 0,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching sanction stats (table may not exist):", errorMessage);
      return {
        totalActive: 0,
        totalExpired: 0,
        totalRevoked: 0,
        warningsCount: 0,
        suspensionsCount: 0,
        bansCount: 0,
      };
    }
  }

  /**
   * Apply sanction to user
   */
  static async applySanction(
    userId: string,
    sanctionType: SanctionType,
    reason: string,
    description: string,
    durationDays?: number,
    relatedDisputeId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const expiresAt =
        durationDays && sanctionType !== "permanent_ban"
          ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
          : null;

      const { error } = await supabase.from("sanctions").insert({
        user_id: userId,
        sanction_type: sanctionType,
        reason,
        description,
        expires_at: expiresAt,
        status: "active",
        related_dispute_id: relatedDisputeId,
      });

      if (error) throw error;

      if (sanctionType === "permanent_ban" || sanctionType === "temporary_suspension") {
        await supabase
          .from("user_profiles")
          .update({ status: "suspended" })
          .eq("id", userId);
      }

      return { success: true };
    } catch (error) {
      console.error("Error applying sanction:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'application de la sanction",
      };
    }
  }

  /**
   * Revoke sanction
   */
  static async revokeSanction(
    sanctionId: string,
    revokeReason: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const { error } = await supabase
        .from("sanctions")
        .update({
          status: "revoked",
          revoked_at: new Date().toISOString(),
          revoke_reason: revokeReason,
        })
        .eq("sanction_id", sanctionId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Error revoking sanction:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la révocation de la sanction",
      };
    }
  }

  /**
   * Get sanction type label
   */
  private static getSanctionTypeLabel(sanctionType: SanctionType): string {
    const labels: Record<SanctionType, string> = {
      warning: "Avertissement",
      temporary_suspension: "Suspension temporaire",
      permanent_ban: "Bannissement permanent",
      account_restriction: "Restriction de compte",
    };
    return labels[sanctionType] || sanctionType;
  }

  /**
   * Check and update expired sanctions
   */
  static async updateExpiredSanctions(): Promise<void> {
    const supabase = await createClient();

    try {
      const now = new Date().toISOString();

      await supabase
        .from("sanctions")
        .update({ status: "expired" })
        .eq("status", "active")
        .not("expires_at", "is", null)
        .lte("expires_at", now);
    } catch (error) {
      console.error("Error updating expired sanctions:", error);
    }
  }
}
