/**
 * System Server Actions
 * Server actions for system administration and logging
 */

"use server";

import { AdminLogService } from "@/services/admin-log.service";
import type { LogFilters, PaginationParams } from "@/types/system.types";
import { getUser } from "./auth.actions";

/**
 * Get admin logs with filters and pagination
 */
export async function getAdminLogs(
  filters: LogFilters = {},
  pagination: PaginationParams = { page: 1, limit: 50 }
) {
  try {
    const user = await getUser();
    if (!user || user.profile?.user_type !== "admin") {
      return { success: false, error: "Accès non autorisé" };
    }

    const result = await AdminLogService.getLogs(filters, pagination);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in getAdminLogs:", error);
    return { success: false, error: "Erreur lors de la récupération des logs" };
  }
}

/**
 * Get activity summary
 */
export async function getActivitySummary(days: number = 7) {
  try {
    const user = await getUser();
    if (!user || user.profile?.user_type !== "admin") {
      return { success: false, error: "Accès non autorisé" };
    }

    const summary = await AdminLogService.getActivitySummary(days);
    return { success: true, data: summary };
  } catch (error) {
    console.error("Error in getActivitySummary:", error);
    return { success: false, error: "Erreur lors de la récupération du résumé" };
  }
}

/**
 * Get system metrics
 */
export async function getSystemMetrics() {
  try {
    const user = await getUser();
    if (!user || user.profile?.user_type !== "admin") {
      return { success: false, error: "Accès non autorisé" };
    }

    const metrics = await AdminLogService.getSystemMetrics();
    return { success: true, data: metrics };
  } catch (error) {
    console.error("Error in getSystemMetrics:", error);
    return { success: false, error: "Erreur lors de la récupération des métriques" };
  }
}

/**
 * Get logs by entity for audit trail
 */
export async function getLogsByEntity(entityType: string, entityId: string) {
  try {
    const user = await getUser();
    if (!user || user.profile?.user_type !== "admin") {
      return { success: false, error: "Accès non autorisé" };
    }

    const logs = await AdminLogService.getLogsByEntity(entityType, entityId);
    return { success: true, data: logs };
  } catch (error) {
    console.error("Error in getLogsByEntity:", error);
    return { success: false, error: "Erreur lors de la récupération des logs" };
  }
}
