/**
 * Executant-specific types for the TikTok Visibility Platform
 * Extends base database types with business logic types
 */

import type { UserProfile, ExecutantProfile, ExecutantWallet } from "./database.types";

/**
 * Complete executant data with all related information
 */
export interface ExecutantWithProfile {
  user: UserProfile;
  profile: ExecutantProfile;
  wallet?: ExecutantWallet;
}

/**
 * Executant statistics for display
 */
export interface ExecutantStats {
  totalTasksCompleted: number;
  totalEarned: number;
  totalEarnedFormatted: string;
  accountBalance: number;
  accountBalanceFormatted: string;
  pendingBalance: number;
  pendingBalanceFormatted: string;
  successRate: number;
  averageRating: number;
  activeTasks: number;
  memberSince: string;
  lastActive: string | null;
  subscriptionStatus: "active" | "expired" | "none";
  subscriptionExpiry: string | null;
}

/**
 * Executant for list display
 */
export interface ExecutantListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  tiktokHandle: string | null;
  totalTasks: number;
  totalEarned: string;
  successRate: number;
  rating: number;
  status: "pending_verification" | "active" | "suspended" | "banned";
  isVerified: boolean;
  subscriptionTier: string | null;
  joinedDate: string;
  lastLogin: string | null;
}

/**
 * Recent task execution for executant display
 */
export interface ExecutantTask {
  id: string;
  campaignTitle: string;
  campaignId: string;
  taskType: string;
  amount: string;
  status: "assigned" | "in_progress" | "submitted" | "completed" | "rejected";
  submittedAt: string | null;
  completedAt: string | null;
  rejectionReason: string | null;
}

/**
 * Executant filters for list page
 */
export interface ExecutantFilters {
  search?: string;
  status?: "all" | "active" | "pending_verification" | "suspended" | "banned";
  verified?: boolean;
  subscriptionTier?: string;
  sortBy?: "name" | "joinedDate" | "totalEarned" | "tasks" | "rating";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * Paginated executant list response
 */
export interface PaginatedExecutants {
  executants: ExecutantListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Subscription tiers
 */
export const SUBSCRIPTION_TIERS = [
  { value: "basic_5k", label: "Basic - 5K FCFA", price: 5000 },
  { value: "standard_7k", label: "Standard - 7K FCFA", price: 7000 },
  { value: "premium_10k", label: "Premium - 10K FCFA", price: 10000 },
  { value: "pro_20k", label: "Pro - 20K FCFA", price: 20000 },
] as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[number]["value"];

/**
 * Verification levels
 */
export const VERIFICATION_LEVELS = [
  "basic",
  "identity_verified",
  "phone_verified",
  "full_verified",
] as const;

export type VerificationLevel = typeof VERIFICATION_LEVELS[number];

/**
 * Social media platforms
 */
export interface SocialMediaAccounts {
  tiktok?: {
    username: string;
    followers?: number;
    verified?: boolean;
  };
  instagram?: {
    username: string;
    followers?: number;
  };
  facebook?: {
    username: string;
  };
  twitter?: {
    username: string;
  };
}
