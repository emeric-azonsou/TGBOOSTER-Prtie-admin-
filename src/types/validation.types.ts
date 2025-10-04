/**
 * Validation Types
 * Type definitions for task validation system
 */

import type { ExecutionStatus, TaskType } from "./database.types";

export type { ExecutionStatus, TaskType };

export interface PendingTaskExecution {
  execution_id: string;
  task_id: string;
  executant_id: string;
  executant_name: string;
  executant_email: string;
  campaign_id: string;
  campaign_title: string;
  task_type: TaskType;
  task_type_label: string;
  submitted_at: string;
  submitted_at_relative: string;
  proof_urls: string[] | null;
  proof_screenshots: string[] | null;
  executant_notes: string | null;
  reward_cents: number;
  reward_formatted: string;
  status: ExecutionStatus;
}

export interface ValidationFilters {
  search?: string;
  taskType?: TaskType | "all";
  campaignId?: string;
  executantId?: string;
  sortBy?: "submittedDate" | "amount" | "executant";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginatedValidations {
  tasks: PendingTaskExecution[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ValidationAction {
  executionId: string;
  action: "approve" | "reject";
  rating?: number;
  bonusCents?: number;
  rejectionReason?: string;
  reviewNotes?: string;
}

export interface BulkValidationAction {
  executionIds: string[];
  action: "approve" | "reject";
  rejectionReason?: string;
}

export interface ValidationStats {
  pendingCount: number;
  approvedToday: number;
  rejectedToday: number;
  averageProcessingTime: number | null;
  oldestPending: string | null;
}
