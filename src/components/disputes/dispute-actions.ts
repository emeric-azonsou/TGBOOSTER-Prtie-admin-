/**
 * Dispute Actions - Server actions for dispute management
 */

"use server";

import { revalidatePath } from "next/cache";
import { DisputeService } from "@/services/dispute.service";
import { SanctionService } from "@/services/sanction.service";
import type {
  DisputeFilters,
  DisputeResolution,
  DisputePriority,
  SanctionType,
  SanctionFilters,
} from "@/types/dispute.types";

export async function getDisputes(filters: DisputeFilters = {}) {
  try {
    const result = await DisputeService.getDisputes(filters);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching disputes:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des litiges",
      data: null,
    };
  }
}

export async function getDisputeById(disputeId: string) {
  try {
    const result = await DisputeService.getDisputeById(disputeId);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching dispute:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du litige",
      data: null,
    };
  }
}

export async function resolveDispute(
  disputeId: string,
  resolution: DisputeResolution,
  resolutionNotes: string,
  refundAmountCents?: number
) {
  try {
    const result = await DisputeService.resolveDispute(
      disputeId,
      resolution,
      resolutionNotes,
      refundAmountCents
    );

    if (result.success) {
      revalidatePath("/disputes");
      revalidatePath("/disputes/active");
      revalidatePath("/disputes/resolved");
      return { success: true };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Error resolving dispute:", error);
    return {
      success: false,
      error: "Erreur lors de la résolution du litige",
    };
  }
}

export async function assignDispute(disputeId: string, moderatorId: string) {
  try {
    const result = await DisputeService.assignDispute(disputeId, moderatorId);

    if (result.success) {
      revalidatePath("/disputes");
      revalidatePath("/disputes/active");
      return { success: true };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Error assigning dispute:", error);
    return {
      success: false,
      error: "Erreur lors de l'assignation du litige",
    };
  }
}

export async function escalateDispute(
  disputeId: string,
  escalationNotes: string
) {
  try {
    const result = await DisputeService.escalateDispute(
      disputeId,
      escalationNotes
    );

    if (result.success) {
      revalidatePath("/disputes");
      revalidatePath("/disputes/active");
      return { success: true };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Error escalating dispute:", error);
    return {
      success: false,
      error: "Erreur lors de l'escalade du litige",
    };
  }
}

export async function updateDisputePriority(
  disputeId: string,
  priority: DisputePriority
) {
  try {
    const result = await DisputeService.updateDisputePriority(
      disputeId,
      priority
    );

    if (result.success) {
      revalidatePath("/disputes");
      revalidatePath("/disputes/active");
      return { success: true };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Error updating dispute priority:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour de la priorité",
    };
  }
}

export async function getSanctions(filters: SanctionFilters = {}) {
  try {
    const result = await SanctionService.getSanctions(filters);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching sanctions:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des sanctions",
      data: null,
    };
  }
}

export async function applySanction(
  userId: string,
  sanctionType: SanctionType,
  reason: string,
  description: string,
  durationDays?: number,
  relatedDisputeId?: string
) {
  try {
    const result = await SanctionService.applySanction(
      userId,
      sanctionType,
      reason,
      description,
      durationDays,
      relatedDisputeId
    );

    if (result.success) {
      revalidatePath("/disputes");
      revalidatePath("/disputes/sanctions");
      revalidatePath("/users");
      return { success: true };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Error applying sanction:", error);
    return {
      success: false,
      error: "Erreur lors de l'application de la sanction",
    };
  }
}

export async function revokeSanction(sanctionId: string, revokeReason: string) {
  try {
    const result = await SanctionService.revokeSanction(
      sanctionId,
      revokeReason
    );

    if (result.success) {
      revalidatePath("/disputes/sanctions");
      return { success: true };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Error revoking sanction:", error);
    return {
      success: false,
      error: "Erreur lors de la révocation de la sanction",
    };
  }
}

export async function refreshDisputes() {
  try {
    revalidatePath("/disputes");
    revalidatePath("/disputes/active");
    revalidatePath("/disputes/resolved");
    revalidatePath("/disputes/sanctions");
    return { success: true };
  } catch (error) {
    console.error("Error refreshing disputes:", error);
    return {
      success: false,
      error: "Erreur lors du rafraîchissement",
    };
  }
}
