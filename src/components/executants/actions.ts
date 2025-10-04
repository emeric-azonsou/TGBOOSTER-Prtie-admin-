/**
 * Executant Admin Actions - Server actions for executant management
 */

"use server";

import { revalidatePath } from "next/cache";
import { ExecutantService } from "@/services/executant.service";

/**
 * Verify an executant's identity
 */
export async function verifyExecutant(executantId: string) {
  try {
    await ExecutantService.verifyExecutant(executantId, "full_verified");
    revalidatePath(`/users/executants/${executantId}`);
    revalidatePath("/users/executants");
    return { success: true };
  } catch (error) {
    console.error("Error verifying executant:", error);
    throw new Error("Failed to verify executant");
  }
}

/**
 * Suspend or reactivate an executant
 */
export async function suspendExecutant(executantId: string) {
  try {
    const executant = await ExecutantService.getExecutantById(executantId);
    if (!executant) {
      throw new Error("Executant not found");
    }

    const newStatus = executant.user.status === "suspended" ? "active" : "suspended";
    await ExecutantService.updateExecutantStatus(executantId, newStatus);

    revalidatePath(`/users/executants/${executantId}`);
    revalidatePath("/users/executants");
    return { success: true };
  } catch (error) {
    console.error("Error suspending executant:", error);
    throw new Error("Failed to suspend executant");
  }
}

/**
 * Ban an executant permanently
 */
export async function banExecutant(executantId: string) {
  try {
    await ExecutantService.updateExecutantStatus(executantId, "banned");
    revalidatePath(`/users/executants/${executantId}`);
    revalidatePath("/users/executants");
    return { success: true };
  } catch (error) {
    console.error("Error banning executant:", error);
    throw new Error("Failed to ban executant");
  }
}

/**
 * Delete an executant (soft delete - sets status to banned)
 */
export async function deleteExecutant(executantId: string) {
  try {
    await ExecutantService.deleteExecutant(executantId);
    revalidatePath("/users/executants");
    return { success: true };
  } catch (error) {
    console.error("Error deleting executant:", error);
    throw new Error("Failed to delete executant");
  }
}
