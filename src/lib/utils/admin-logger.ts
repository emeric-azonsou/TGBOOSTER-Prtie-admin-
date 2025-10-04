/**
 * Admin Logger Utility
 * Centralized utility for logging admin actions automatically
 */

import { AdminLogService } from "@/services/admin-log.service";
import type { LogAction, EntityType, CreateLogInput } from "@/types/system.types";

export class AdminLogger {
  /**
   * Log an admin action
   */
  static async log(params: {
    adminId: string;
    action: LogAction;
    entityType?: EntityType;
    entityId?: string;
    details?: Record<string, unknown>;
    request?: Request;
  }): Promise<void> {
    try {
      const logInput: CreateLogInput = {
        admin_id: params.adminId,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        details: params.details,
      };

      if (params.request) {
        logInput.ip_address = this.getClientIp(params.request);
        logInput.user_agent = params.request.headers.get("user-agent") || undefined;
      }

      await AdminLogService.createLog(logInput);
    } catch (error) {
      console.error("Failed to log admin action:", error);
    }
  }

  /**
   * Log user-related action
   */
  static async logUserAction(
    adminId: string,
    action: Extract<LogAction, "user_created" | "user_updated" | "user_suspended" | "user_banned">,
    userId: string,
    details?: Record<string, unknown>,
    request?: Request
  ): Promise<void> {
    await this.log({
      adminId,
      action,
      entityType: "user",
      entityId: userId,
      details,
      request,
    });
  }

  /**
   * Log task-related action
   */
  static async logTaskAction(
    adminId: string,
    action: Extract<LogAction, "task_validated" | "task_rejected" | "task_created" | "task_updated">,
    taskId: string,
    details?: Record<string, unknown>,
    request?: Request
  ): Promise<void> {
    await this.log({
      adminId,
      action,
      entityType: "task",
      entityId: taskId,
      details,
      request,
    });
  }

  /**
   * Log dispute-related action
   */
  static async logDisputeAction(
    adminId: string,
    action: Extract<LogAction, "dispute_created" | "dispute_resolved">,
    disputeId: string,
    details?: Record<string, unknown>,
    request?: Request
  ): Promise<void> {
    await this.log({
      adminId,
      action,
      entityType: "dispute",
      entityId: disputeId,
      details,
      request,
    });
  }

  /**
   * Log withdrawal-related action
   */
  static async logWithdrawalAction(
    adminId: string,
    action: Extract<LogAction, "withdrawal_approved" | "withdrawal_rejected">,
    withdrawalId: string,
    details?: Record<string, unknown>,
    request?: Request
  ): Promise<void> {
    await this.log({
      adminId,
      action,
      entityType: "withdrawal",
      entityId: withdrawalId,
      details,
      request,
    });
  }

  /**
   * Log payment-related action
   */
  static async logPaymentAction(
    adminId: string,
    paymentId: string,
    details?: Record<string, unknown>,
    request?: Request
  ): Promise<void> {
    await this.log({
      adminId,
      action: "payment_processed",
      entityType: "payment",
      entityId: paymentId,
      details,
      request,
    });
  }

  /**
   * Log system configuration update
   */
  static async logSystemConfig(
    adminId: string,
    configKey: string,
    details?: Record<string, unknown>,
    request?: Request
  ): Promise<void> {
    await this.log({
      adminId,
      action: "system_config_updated",
      entityType: "system_config",
      entityId: configKey,
      details,
      request,
    });
  }

  /**
   * Log admin login
   */
  static async logLogin(
    adminId: string,
    success: boolean,
    request?: Request
  ): Promise<void> {
    await this.log({
      adminId,
      action: "admin_login",
      details: { success },
      request,
    });
  }

  /**
   * Log admin logout
   */
  static async logLogout(
    adminId: string,
    request?: Request
  ): Promise<void> {
    await this.log({
      adminId,
      action: "admin_logout",
      request,
    });
  }

  /**
   * Extract client IP from request
   */
  private static getClientIp(request: Request): string | undefined {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }

    const realIp = request.headers.get("x-real-ip");
    if (realIp) {
      return realIp;
    }

    return undefined;
  }
}
