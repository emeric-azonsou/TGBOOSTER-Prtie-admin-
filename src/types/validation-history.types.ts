/**
 * Validation History Types
 * Type definitions for validation history tracking
 */

import type { ExecutionStatus, TaskType } from "./database.types";

export type ValidationDecision = "approved" | "rejected";

export interface ValidationHistoryRecord {
  execution_id: string;
  task_id: string;
  executant_id: string;
  executant_name: string;
  executant_email: string;
  campaign_id: string;
  campaign_title: string;
  task_type: TaskType;
  task_type_label: string;
  reviewer_id: string;
  reviewer_name: string;
  decision: ValidationDecision;
  reviewed_at: string;
  reviewed_at_relative: string;
  submitted_at: string;
  reward_cents: number;
  reward_formatted: string;
  bonus_cents: number;
  bonus_formatted: string | null;
  rating: number | null;
  rejection_reason: string | null;
  review_notes: string | null;
  proof_urls: string[] | null;
  proof_screenshots: string[] | null;
  executant_notes: string | null;
}

export interface ValidationHistoryFilters {
  search?: string;
  decision?: ValidationDecision | "all";
  taskType?: TaskType | "all";
  campaignId?: string;
  executantId?: string;
  reviewerId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "reviewedDate" | "submittedDate" | "amount" | "executant" | "reviewer";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginatedValidationHistory {
  records: ValidationHistoryRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: ValidationHistorySummary;
}

export interface ValidationHistorySummary {
  totalValidations: number;
  totalApproved: number;
  totalRejected: number;
  approvalRate: number;
  totalRewardPaid: number;
  totalBonusPaid: number;
  averageRating: number | null;
  topRejectionReasons: Array<{
    reason: string;
    count: number;
  }>;
}

export interface ValidationHistoryStats {
  byDate: Array<{
    date: string;
    approved: number;
    rejected: number;
  }>;
  byTaskType: Array<{
    taskType: TaskType;
    approved: number;
    rejected: number;
    approvalRate: number;
  }>;
  byReviewer: Array<{
    reviewerId: string;
    reviewerName: string;
    totalReviews: number;
    approvalRate: number;
    averageProcessingTime: number;
  }>;
}
