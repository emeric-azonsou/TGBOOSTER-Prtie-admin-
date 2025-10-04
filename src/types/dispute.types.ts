/**
 * Dispute Types
 * Type definitions for dispute management system
 */

export type DisputeStatus = "pending" | "investigating" | "resolved" | "escalated" | "closed";
export type DisputePriority = "low" | "normal" | "high" | "urgent";
export type DisputeResolution = "favor_client" | "favor_executant" | "partial_refund" | "no_action" | "escalated";
export type SanctionType = "warning" | "temporary_suspension" | "permanent_ban" | "account_restriction";
export type SanctionStatus = "active" | "expired" | "revoked";

export interface Dispute {
  dispute_id: string;
  task_execution_id: string;
  task_id: string;
  campaign_title: string;
  client_id: string;
  client_name: string;
  client_email: string;
  executant_id: string;
  executant_name: string;
  executant_email: string;
  reason: string;
  description: string;
  evidence_urls: string[] | null;
  status: DisputeStatus;
  priority: DisputePriority;
  submitted_by: "client" | "executant" | "system";
  submitted_at: string;
  submitted_at_relative: string;
  assigned_to: string | null;
  moderator_name: string | null;
  resolution: DisputeResolution | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  resolved_at_relative: string | null;
  refund_amount_cents: number | null;
  refund_amount_formatted: string | null;
  metadata: Record<string, unknown> | null;
}

export interface DisputeFilters {
  search?: string;
  status?: DisputeStatus | "all";
  priority?: DisputePriority | "all";
  submittedBy?: "client" | "executant" | "system" | "all";
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "submittedDate" | "priority" | "client" | "executant";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginatedDisputes {
  disputes: Dispute[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: DisputeStats;
}

export interface DisputeStats {
  totalPending: number;
  totalInvestigating: number;
  totalResolved: number;
  totalEscalated: number;
  averageResolutionTime: number | null;
  oldestPending: string | null;
  resolutionRate: number;
}

export interface DisputeResolutionAction {
  disputeId: string;
  resolution: DisputeResolution;
  resolutionNotes: string;
  refundAmountCents?: number;
  sanctionUserId?: string;
  sanctionType?: SanctionType;
  sanctionReason?: string;
  sanctionDuration?: number;
}

export interface Sanction {
  sanction_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_type: "client" | "executant";
  sanction_type: SanctionType;
  sanction_type_label: string;
  reason: string;
  description: string | null;
  applied_by: string;
  moderator_name: string;
  applied_at: string;
  applied_at_relative: string;
  expires_at: string | null;
  expires_at_relative: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  revoke_reason: string | null;
  status: SanctionStatus;
  related_dispute_id: string | null;
  metadata: Record<string, unknown> | null;
}

export interface SanctionFilters {
  search?: string;
  sanctionType?: SanctionType | "all";
  userType?: "client" | "executant" | "all";
  status?: SanctionStatus | "all";
  appliedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "appliedDate" | "expiryDate" | "user";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginatedSanctions {
  sanctions: Sanction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: SanctionStats;
}

export interface SanctionStats {
  totalActive: number;
  totalExpired: number;
  totalRevoked: number;
  warningsCount: number;
  suspensionsCount: number;
  bansCount: number;
}

export interface ApplySanctionAction {
  userId: string;
  sanctionType: SanctionType;
  reason: string;
  description?: string;
  durationDays?: number;
  relatedDisputeId?: string;
}

export interface RevokeSanctionAction {
  sanctionId: string;
  revokeReason: string;
}
