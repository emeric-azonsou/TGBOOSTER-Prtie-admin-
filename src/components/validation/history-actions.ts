/**
 * Validation History Actions - Server actions for validation history
 */

"use server";

import { revalidatePath } from "next/cache";
import { ValidationHistoryService } from "@/services/validation-history.service";
import type { ValidationHistoryFilters } from "@/types/validation-history.types";

export async function getValidationHistory(filters: ValidationHistoryFilters = {}) {
  try {
    const result = await ValidationHistoryService.getValidationHistory(filters);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching validation history:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération de l'historique",
      data: null,
    };
  }
}

export async function getValidationSummary(filters: ValidationHistoryFilters = {}) {
  try {
    const result = await ValidationHistoryService.getValidationSummary(filters);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching validation summary:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du résumé",
      data: null,
    };
  }
}

export async function getValidationStats(dateFrom?: string, dateTo?: string) {
  try {
    const result = await ValidationHistoryService.getValidationStats(
      dateFrom,
      dateTo
    );
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching validation stats:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des statistiques",
      data: null,
    };
  }
}

export async function exportValidationHistory(
  filters: ValidationHistoryFilters = {}
) {
  try {
    const csvContent = await ValidationHistoryService.exportToCSV(filters);

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `historique-validations-${timestamp}.csv`;

    return {
      success: true,
      data: {
        csvContent,
        filename,
        blob: blob.toString(),
      },
    };
  } catch (error) {
    console.error("Error exporting validation history:", error);
    return {
      success: false,
      error: "Erreur lors de l'export de l'historique",
      data: null,
    };
  }
}

export async function refreshValidationHistory() {
  try {
    revalidatePath("/validation/history");
    return { success: true };
  } catch (error) {
    console.error("Error refreshing validation history:", error);
    return {
      success: false,
      error: "Erreur lors du rafraîchissement",
    };
  }
}
