/**
 * Database Types - Auto-generated from Supabase Schema
 * Based on TikTok Visibility Platform database structure
 */

export type UserType = "executant" | "client" | "admin";
export type UserStatus = "pending_verification" | "active" | "suspended" | "banned";
export type TaskType = "social_follow" | "social_like" | "social_share" | "social_comment" | "app_download" | "website_visit" | "survey" | "review";
export type TaskStatus = "draft" | "active" | "paused" | "completed" | "cancelled";
export type ExecutionStatus = "assigned" | "in_progress" | "submitted" | "completed" | "rejected";
export type TransactionType = "deposit" | "withdrawal" | "payment" | "refund" | "commission";
export type TransactionStatus = "pending" | "completed" | "failed" | "cancelled";
export type WithdrawalStatus = "pending" | "approved" | "rejected" | "completed";
export type PaymentMethod = "card" | "mobile_money" | "bank_transfer" | "paypal";

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  user_type: UserType;
  status: UserStatus;
  avatar_url: string | null;
  date_of_birth: string | null;
  country: string | null;
  city: string | null;
  timezone: string;
  language: string;
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  last_login_at: string | null;
  login_count: number;
  referral_code: string | null;
  referred_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ClientProfile {
  client_id: string;
  company_name: string | null;
  website: string | null;
  industry: string | null;
  company_size: string | null;
  monthly_budget_cents: number | null;
  preferred_categories: string[] | null;
  business_type: string | null;
  tax_id: string | null;
  billing_address: Record<string, unknown> | null;
  is_verified: boolean;
  verification_documents: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ExecutantProfile {
  executant_id: string;
  bio: string | null;
  skills: string[] | null;
  social_media_accounts: Record<string, unknown> | null;
  rating_avg: number;
  total_tasks_completed: number;
  success_rate: number;
  preferred_task_types: string[] | null;
  availability_hours: Record<string, unknown> | null;
  is_verified: boolean;
  verification_level: string;
  identity_documents: Record<string, unknown> | null;
  bank_details: Record<string, unknown> | null;
  subscription_plan_id: string | null;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
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
  priority: string;
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

export interface TaskExecution {
  execution_id: string;
  task_id: string;
  executant_id: string;
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
  updated_at: string;
}

export interface ClientWallet {
  wallet_id: string;
  client_id: string;
  balance_cents: number;
  pending_cents: number;
  total_spent_cents: number;
  currency_code: string;
  created_at: string;
  updated_at: string;
}

export interface ExecutantWallet {
  wallet_id: string;
  executant_id: string;
  balance_cents: number;
  pending_cents: number;
  total_earned_cents: number;
  currency_code: string;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalRequest {
  withdrawal_id: string;
  executant_id: string;
  amount_cents: number;
  status: WithdrawalStatus;
  payment_method: PaymentMethod;
  payment_details: Record<string, unknown>;
  processed_by: string | null;
  rejection_reason: string | null;
  external_transaction_id: string | null;
  requested_at: string;
  processed_at: string | null;
  completed_at: string | null;
}
