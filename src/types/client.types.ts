/**
 * Client-specific types for the TikTok Visibility Platform
 * Extends base database types with business logic types
 */

import type { UserProfile, ClientProfile, ClientWallet } from "./database.types";

/**
 * Complete client data with all related information
 */
export interface ClientWithProfile {
  user: UserProfile;
  profile: ClientProfile;
  wallet?: ClientWallet;
}

/**
 * Client statistics for display
 */
export interface ClientStats {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalSpent: number;
  totalSpentFormatted: string;
  averageCampaignBudget: number;
  accountBalance: number;
  accountBalanceFormatted: string;
  pendingBalance: number;
  memberSince: string;
  lastActive: string | null;
}

/**
 * Client for list display
 */
export interface ClientListItem {
  id: string;
  name: string;
  email: string;
  company: string | null;
  businessType: string | null;
  totalCampaigns: number;
  totalSpent: string;
  status: "pending_verification" | "active" | "suspended" | "banned";
  isVerified: boolean;
  joinedDate: string;
  lastLogin: string | null;
}

/**
 * Recent campaign for client display
 */
export interface ClientCampaign {
  id: string;
  title: string;
  type: string;
  budget: string;
  spent: string;
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  progress: number;
  startDate: string;
  endDate: string | null;
  quantityRequired: number;
  quantityCompleted: number;
}

/**
 * Client form data for create/update
 */
export interface ClientFormData {
  // User info
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;

  // Client profile
  companyName: string | null;
  businessType: string | null;
  industry: string | null;
  companySize: string | null;
  website: string | null;
  monthlyBudget: number | null;
  taxId: string | null;

  // Address
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

/**
 * Client filters for list page
 */
export interface ClientFilters {
  search?: string;
  status?: "all" | "active" | "pending_verification" | "suspended" | "banned";
  businessType?: string;
  verified?: boolean;
  sortBy?: "name" | "joinedDate" | "totalSpent" | "campaigns";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * Paginated client list response
 */
export interface PaginatedClients {
  clients: ClientListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Business types available for clients
 */
export const BUSINESS_TYPES = [
  "Artiste/Musicien",
  "Marque/Fashion",
  "Restaurant",
  "E-commerce",
  "Service",
  "Influenceur",
  "Agence Marketing",
  "ONG/Association",
  "Autre",
] as const;

export type BusinessType = typeof BUSINESS_TYPES[number];

/**
 * Company sizes
 */
export const COMPANY_SIZES = [
  "1-10 employés",
  "11-50 employés",
  "51-200 employés",
  "201-500 employés",
  "500+ employés",
] as const;

export type CompanySize = typeof COMPANY_SIZES[number];

/**
 * Industries available
 */
export const INDUSTRIES = [
  "Musique",
  "Mode & Beauté",
  "Restauration",
  "Commerce",
  "Services",
  "Technologie",
  "Éducation",
  "Santé",
  "Divertissement",
  "Sport",
  "Autre",
] as const;

export type Industry = typeof INDUSTRIES[number];
