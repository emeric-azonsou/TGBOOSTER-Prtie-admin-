/**
 * Validation Actions - Server actions for task validation
 */

"use server";

import { revalidatePath } from "next/cache";
import { ValidationService } from "@/services/validation.service";

export async function approveTask(
  executionId: string,
  rating?: number,
  bonusCents?: number,
  reviewNotes?: string
) {
  try {
    const result = await ValidationService.approveExecution(
      executionId,
      rating,
      bonusCents,
      reviewNotes
    );

    if (result.success) {
      revalidatePath("/validation");
      revalidatePath("/campaigns");
      return { success: true };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Error approving task:", error);
    return {
      success: false,
      error: "Erreur lors de la validation de la tâche",
    };
  }
}

export async function rejectTask(
  executionId: string,
  rejectionReason: string,
  reviewNotes?: string
) {
  try {
    const result = await ValidationService.rejectExecution(
      executionId,
      rejectionReason,
      reviewNotes
    );

    if (result.success) {
      revalidatePath("/validation");
      revalidatePath("/campaigns");
      return { success: true };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Error rejecting task:", error);
    return {
      success: false,
      error: "Erreur lors du rejet de la tâche",
    };
  }
}

export async function bulkApproveTasks(executionIds: string[]) {
  try {
    const result = await ValidationService.bulkApprove(executionIds);

    if (result.success) {
      revalidatePath("/validation");
      revalidatePath("/campaigns");
      return { success: true };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Error bulk approving tasks:", error);
    return {
      success: false,
      error: "Erreur lors de la validation en masse",
    };
  }
}

export async function bulkRejectTasks(
  executionIds: string[],
  rejectionReason: string
) {
  try {
    const result = await ValidationService.bulkReject(
      executionIds,
      rejectionReason
    );

    if (result.success) {
      revalidatePath("/validation");
      revalidatePath("/campaigns");
      return { success: true };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Error bulk rejecting tasks:", error);
    return {
      success: false,
      error: "Erreur lors du rejet en masse",
    };
  }
}
