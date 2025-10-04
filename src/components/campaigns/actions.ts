/**
 * Campaign Actions - Server actions for campaign operations
 */

"use server";

import { revalidatePath } from "next/cache";
import { CampaignService } from "@/services/campaign.service";
import type {
  TaskStatus,
  CampaignFormData,
  CampaignUpdateData,
  ExecutionUpdateData,
} from "@/types/campaign.types";

export async function pauseCampaign(campaignId: string) {
  try {
    const result = await CampaignService.updateCampaignStatus(
      campaignId,
      "paused"
    );

    if (result.success) {
      revalidatePath("/campaigns");
      revalidatePath(`/campaigns/${campaignId}`);
      return { success: true };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Error pausing campaign:", error);
    return {
      success: false,
      error: "Erreur lors de la mise en pause de la campagne",
    };
  }
}

export async function resumeCampaign(campaignId: string) {
  try {
    const result = await CampaignService.updateCampaignStatus(
      campaignId,
      "active"
    );

    if (result.success) {
      revalidatePath("/campaigns");
      revalidatePath(`/campaigns/${campaignId}`);
      return { success: true };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Error resuming campaign:", error);
    return {
      success: false,
      error: "Erreur lors de la reprise de la campagne",
    };
  }
}

export async function cancelCampaign(campaignId: string) {
  try {
    const result = await CampaignService.deleteCampaign(campaignId);

    if (result.success) {
      revalidatePath("/campaigns");
      revalidatePath(`/campaigns/${campaignId}`);
      return { success: true };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Error cancelling campaign:", error);
    return {
      success: false,
      error: "Erreur lors de l'annulation de la campagne",
    };
  }
}

export async function updateCampaignStatus(
  campaignId: string,
  status: TaskStatus
) {
  try {
    const result = await CampaignService.updateCampaignStatus(
      campaignId,
      status
    );

    if (result.success) {
      revalidatePath("/campaigns");
      revalidatePath(`/campaigns/${campaignId}`);
      return { success: true };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Error updating campaign status:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du statut",
    };
  }
}

export async function updateCampaign(
  campaignId: string,
  data: CampaignUpdateData
) {
  try {
    const result = await CampaignService.updateCampaign(campaignId, data);

    if (result.success) {
      revalidatePath("/campaigns");
      revalidatePath(`/campaigns/${campaignId}`);
      return { success: true };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Error updating campaign:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour de la campagne",
    };
  }
}

export async function createCampaign(
  clientId: string,
  data: CampaignFormData
) {
  try {
    const result = await CampaignService.createCampaign(clientId, data);

    if (result.success && result.campaignId) {
      revalidatePath("/campaigns");
      return { success: true, campaignId: result.campaignId };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Error creating campaign:", error);
    return {
      success: false,
      error: "Erreur lors de la création de la campagne",
    };
  }
}

export async function approveExecution(
  executionId: string,
  rating?: number,
  bonusCents?: number
) {
  try {
    const updateData: ExecutionUpdateData = {
      status: "completed",
      rating,
      bonusCents,
    };

    const result = await CampaignService.updateExecution(
      executionId,
      updateData
    );

    if (result.success) {
      revalidatePath("/campaigns");
      revalidatePath("/validation");
      return { success: true };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Error approving execution:", error);
    return {
      success: false,
      error: "Erreur lors de la validation de l'exécution",
    };
  }
}

export async function rejectExecution(
  executionId: string,
  rejectionReason: string
) {
  try {
    const updateData: ExecutionUpdateData = {
      status: "rejected",
      rejectionReason,
    };

    const result = await CampaignService.updateExecution(
      executionId,
      updateData
    );

    if (result.success) {
      revalidatePath("/campaigns");
      revalidatePath("/validation");
      return { success: true };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error("Error rejecting execution:", error);
    return {
      success: false,
      error: "Erreur lors du rejet de l'exécution",
    };
  }
}
