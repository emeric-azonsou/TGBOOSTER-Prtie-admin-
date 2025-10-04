/**
 * Campaign Types
 * Type definitions for campaign management across the platform
 */

import type { TaskType, TaskStatus, ExecutionStatus } from "./database.types";

export type { TaskType, TaskStatus, ExecutionStatus };
export type TaskPriority = "low" | "normal" | "high" | "urgent";

export interface Campaign {
  task_id: string;
  client_id: string;
  title: string;
  description: string;
  task_type: TaskType;
  target_url: string;
  target_username: string | null;
  instructions: string | null;
  proof_requirements: string[] | null;
  quantity_required: number;
  quantity_completed: number;
  reward_per_execution_cents: number;
  total_budget_cents: number;
  remaining_budget_cents: number;
  status: TaskStatus;
  priority: TaskPriority;
  start_date: string;
  end_date: string | null;
  target_audience: Record<string, unknown> | null;
  geographic_restrictions: string[] | null;
  age_restrictions: Record<string, unknown> | null;
  required_follower_count: number | null;
  auto_approve: boolean;
  max_executions_per_user: number;
  estimated_duration_minutes: number | null;
  tags: string[] | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CampaignWithClient extends Campaign {
  client: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    company_name: string | null;
  };
}

export interface CampaignListItem {
  id: string;
  title: string;
  clientName: string;
  clientId: string;
  type: string;
  typeRaw: TaskType;
  budget: string;
  budgetCents: number;
  spent: string;
  spentCents: number;
  remaining: string;
  remainingCents: number;
  quantityRequired: number;
  quantityCompleted: number;
  progress: number;
  status: TaskStatus;
  statusLabel: string;
  priority: TaskPriority;
  priorityLabel: string;
  rewardPerAction: string;
  rewardPerActionCents: number;
  startDate: string;
  endDate: string | null;
  createdDate: string;
  estimatedDuration: number | null;
}

export interface CampaignDetails extends CampaignWithClient {
  executions: CampaignExecution[];
  stats: CampaignStats;
}

export interface CampaignExecution {
  execution_id: string;
  task_id: string;
  executant_id: string;
  executant_name: string;
  executant_email: string;
  status: ExecutionStatus;
  assigned_at: string;
  started_at: string | null;
  submitted_at: string | null;
  completed_at: string | null;
  reviewed_at: string | null;
  reviewer_id: string | null;
  proof_urls: string[] | null;
  proof_screenshots: string[] | null;
  executant_notes: string | null;
  review_notes: string | null;
  rejection_reason: string | null;
  reward_cents: number;
  bonus_cents: number;
  rating: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface CampaignStats {
  totalExecutions: number;
  completedExecutions: number;
  pendingExecutions: number;
  rejectedExecutions: number;
  totalSpent: number;
  totalSpentFormatted: string;
  averageCompletionTime: number | null;
  successRate: number;
  averageRating: number;
}

export interface CampaignFilters {
  search?: string;
  status?: TaskStatus | "all";
  type?: TaskType | "all";
  priority?: TaskPriority | "all";
  clientId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "createdDate" | "title" | "budget" | "progress" | "status";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginatedCampaigns {
  campaigns: CampaignListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CampaignFormData {
  title: string;
  description: string;
  taskType: TaskType;
  targetUrl: string;
  targetUsername?: string;
  instructions?: string;
  proofRequirements?: string[];
  quantityRequired: number;
  rewardPerExecutionCents: number;
  totalBudgetCents: number;
  priority?: TaskPriority;
  startDate?: string;
  endDate?: string;
  targetAudience?: Record<string, unknown>;
  geographicRestrictions?: string[];
  ageRestrictions?: Record<string, unknown>;
  requiredFollowerCount?: number;
  autoApprove?: boolean;
  maxExecutionsPerUser?: number;
  estimatedDurationMinutes?: number;
  tags?: string[];
}

export interface CampaignUpdateData {
  title?: string;
  description?: string;
  instructions?: string;
  proofRequirements?: string[];
  quantityRequired?: number;
  rewardPerExecutionCents?: number;
  priority?: TaskPriority;
  endDate?: string;
  status?: TaskStatus;
  autoApprove?: boolean;
  maxExecutionsPerUser?: number;
}

export interface ExecutionUpdateData {
  status: ExecutionStatus;
  reviewNotes?: string;
  rejectionReason?: string;
  rating?: number;
  bonusCents?: number;
}
