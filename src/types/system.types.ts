/**
 * System & Admin Logs Types
 * Types for system administration, logging, and monitoring
 */

export type AdminRole = "global" | "moderator" | "operations" | "support" | "read_only";
export type AdminStatus = "active" | "inactive" | "suspended";
export type LogAction =
  | "user_created"
  | "user_updated"
  | "user_suspended"
  | "user_banned"
  | "task_validated"
  | "task_rejected"
  | "task_created"
  | "task_updated"
  | "dispute_created"
  | "dispute_resolved"
  | "withdrawal_approved"
  | "withdrawal_rejected"
  | "payment_processed"
  | "system_config_updated"
  | "admin_login"
  | "admin_logout";

export type EntityType =
  | "user"
  | "task"
  | "task_execution"
  | "dispute"
  | "withdrawal"
  | "payment"
  | "system_config";

export interface AdminRole {
  id: string;
  user_id: string;
  role: AdminRole;
  status: AdminStatus;
  permissions?: string[];
  created_at: string;
  updated_at: string;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: LogAction;
  entity_type: EntityType | null;
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AdminLogWithUser extends AdminLog {
  admin_name: string;
  admin_email: string;
  admin_role: AdminRole;
}

export interface LogFilters {
  admin_id?: string;
  action?: LogAction;
  entity_type?: EntityType;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface SystemHealth {
  database: "healthy" | "degraded" | "down";
  api: "healthy" | "degraded" | "down";
  storage: "healthy" | "degraded" | "down";
  queue: "healthy" | "degraded" | "down";
  last_checked: string;
}

export interface SystemMetrics {
  total_logs: number;
  logs_today: number;
  active_admins: number;
  error_rate: number;
  avg_response_time_ms: number;
}

export interface ActivitySummary {
  action: LogAction;
  count: number;
  last_occurrence: string;
}

export interface CreateLogInput {
  admin_id: string;
  action: LogAction;
  entity_type?: EntityType;
  entity_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}
