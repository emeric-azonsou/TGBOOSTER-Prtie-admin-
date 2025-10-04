/**
 * Client Service Layer
 * Handles all business logic for client management
 */

import { createClient } from "@/lib/supabase/server";
import type {
  ClientWithProfile,
  ClientStats,
  ClientListItem,
  ClientCampaign,
  ClientFormData,
  ClientFilters,
  PaginatedClients,
} from "@/types/client.types";
import type { UserStatus } from "@/types/database.types";

export class ClientService {
  /**
   * Get paginated list of clients with filters
   */
  static async getClients(filters: ClientFilters = {}): Promise<PaginatedClients> {
    const supabase = await createClient();
    const {
      search,
      status,
      sortBy = "joinedDate",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = filters;

    try {
      let query = supabase
        .from("user_profiles")
        .select(`
          id,
          email,
          first_name,
          last_name,
          status,
          last_login_at,
          created_at,
          client_profiles!client_profiles_client_id_fkey (
            company_name,
            business_type,
            is_verified
          )
        `, { count: "exact" })
        .eq("user_type", "client");

      // Apply filters
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      // Sorting
      const sortColumn = sortBy === "name" ? "first_name" : sortBy === "joinedDate" ? "created_at" : "created_at";
      query = query.order(sortColumn, { ascending: sortOrder === "asc" });

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Get campaign stats for each client
      const clientIds = data?.map(u => u.id) || [];
      const campaignStats = await this.getClientsCampaignStats(clientIds);
      const walletStats = await this.getClientsWalletStats(clientIds);

      const clients: ClientListItem[] = data?.map(user => {
        const profile = Array.isArray(user.client_profiles) ? user.client_profiles[0] : user.client_profiles;
        const stats = campaignStats.get(user.id) || { total: 0, spent: 0 };
        const wallet = walletStats.get(user.id) || { spent: 0 };

        return {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          company: profile?.company_name || null,
          businessType: profile?.business_type || null,
          totalCampaigns: stats.total,
          totalSpent: this.formatCurrency(wallet.spent),
          status: user.status as UserStatus,
          isVerified: profile?.is_verified || false,
          joinedDate: this.formatDate(user.created_at),
          lastLogin: user.last_login_at ? this.formatRelativeTime(user.last_login_at) : null,
        };
      }) || [];

      return {
        clients,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error("Error fetching clients:", error);
      return {
        clients: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
  }

  /**
   * Get complete client details by ID
   */
  static async getClientById(clientId: string): Promise<ClientWithProfile | null> {
    const supabase = await createClient();

    try {
      // Get user profile
      const { data: user, error: userError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", clientId)
        .eq("user_type", "client")
        .single();

      if (userError) throw userError;
      if (!user) return null;

      // Get client profile
      const { data: profile, error: profileError } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("client_id", clientId)
        .single();

      if (profileError) throw profileError;

      // Get wallet
      const { data: wallet } = await supabase
        .from("client_wallets")
        .select("*")
        .eq("client_id", clientId)
        .single();

      return {
        user,
        profile,
        wallet: wallet || undefined,
      };
    } catch (error) {
      console.error("Error fetching client:", error);
      return null;
    }
  }

  /**
   * Get client statistics
   */
  static async getClientStats(clientId: string): Promise<ClientStats | null> {
    const supabase = await createClient();

    try {
      const client = await this.getClientById(clientId);
      if (!client) return null;

      // Get campaign statistics
      const { data: campaigns } = await supabase
        .from("tasks")
        .select("status, total_budget_cents, remaining_budget_cents, created_at")
        .eq("client_id", clientId);

      const totalCampaigns = campaigns?.length || 0;
      const activeCampaigns = campaigns?.filter(c => c.status === "active").length || 0;
      const completedCampaigns = campaigns?.filter(c => c.status === "completed").length || 0;

      const totalSpent = client.wallet?.total_spent_cents || 0;
      const accountBalance = client.wallet?.balance_cents || 0;
      const pendingBalance = client.wallet?.pending_cents || 0;

      const budgets = campaigns?.map(c => c.total_budget_cents || 0) || [];
      const averageCampaignBudget = budgets.length > 0
        ? budgets.reduce((a, b) => a + b, 0) / budgets.length
        : 0;

      return {
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        totalSpent,
        totalSpentFormatted: this.formatCurrency(totalSpent),
        averageCampaignBudget,
        accountBalance,
        accountBalanceFormatted: this.formatCurrency(accountBalance),
        pendingBalance,
        memberSince: this.formatDate(client.user.created_at),
        lastActive: client.user.last_login_at ? this.formatRelativeTime(client.user.last_login_at) : null,
      };
    } catch (error) {
      console.error("Error fetching client stats:", error);
      return null;
    }
  }

  /**
   * Get recent campaigns for a client
   */
  static async getClientCampaigns(clientId: string, limit = 10): Promise<ClientCampaign[]> {
    const supabase = await createClient();

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(task => ({
        id: task.task_id,
        title: task.title,
        type: this.formatTaskType(task.task_type),
        budget: this.formatCurrency(task.total_budget_cents),
        spent: this.formatCurrency(task.total_budget_cents - task.remaining_budget_cents),
        status: task.status,
        progress: Math.round((task.quantity_completed / task.quantity_required) * 100),
        startDate: this.formatDate(task.start_date),
        endDate: task.end_date ? this.formatDate(task.end_date) : null,
        quantityRequired: task.quantity_required,
        quantityCompleted: task.quantity_completed,
      })) || [];
    } catch (error) {
      console.error("Error fetching client campaigns:", error);
      return [];
    }
  }

  /**
   * Create a new client
   */
  static async createClient(formData: ClientFormData): Promise<{ success: boolean; clientId?: string; error?: string }> {
    const supabase = await createClient();

    try {
      // Start transaction-like operations
      // 1. Create user profile
      const { data: user, error: userError } = await supabase
        .from("user_profiles")
        .insert({
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          country: formData.country,
          city: formData.city,
          user_type: "client",
          status: "pending_verification",
        })
        .select()
        .single();

      if (userError) throw userError;

      // 2. Create client profile
      const { error: profileError } = await supabase
        .from("client_profiles")
        .insert({
          client_id: user.id,
          company_name: formData.companyName,
          business_type: formData.businessType,
          industry: formData.industry,
          company_size: formData.companySize,
          website: formData.website,
          monthly_budget_cents: formData.monthlyBudget ? formData.monthlyBudget * 100 : null,
          tax_id: formData.taxId,
          billing_address: formData.billingAddress || null,
          is_verified: false,
        });

      if (profileError) throw profileError;

      // 3. Create wallet
      const { error: walletError } = await supabase
        .from("client_wallets")
        .insert({
          client_id: user.id,
          balance_cents: 0,
          pending_cents: 0,
          total_spent_cents: 0,
          currency_code: "XOF",
        });

      if (walletError) throw walletError;

      return { success: true, clientId: user.id };
    } catch (error) {
      console.error("Error creating client:", error);
      return { success: false, error: error instanceof Error ? error.message : "Erreur lors de la création du client" };
    }
  }

  /**
   * Update client information
   */
  static async updateClient(clientId: string, formData: Partial<ClientFormData>): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      // Update user profile
      if (formData.firstName || formData.lastName || formData.email || formData.phone || formData.country || formData.city) {
        const userUpdates: Record<string, unknown> = {};
        if (formData.firstName) userUpdates.first_name = formData.firstName;
        if (formData.lastName) userUpdates.last_name = formData.lastName;
        if (formData.email) userUpdates.email = formData.email;
        if (formData.phone !== undefined) userUpdates.phone = formData.phone;
        if (formData.country !== undefined) userUpdates.country = formData.country;
        if (formData.city !== undefined) userUpdates.city = formData.city;
        userUpdates.updated_at = new Date().toISOString();

        const { error: userError } = await supabase
          .from("user_profiles")
          .update(userUpdates)
          .eq("id", clientId);

        if (userError) throw userError;
      }

      // Update client profile
      const profileUpdates: Record<string, unknown> = {};
      if (formData.companyName !== undefined) profileUpdates.company_name = formData.companyName;
      if (formData.businessType !== undefined) profileUpdates.business_type = formData.businessType;
      if (formData.industry !== undefined) profileUpdates.industry = formData.industry;
      if (formData.companySize !== undefined) profileUpdates.company_size = formData.companySize;
      if (formData.website !== undefined) profileUpdates.website = formData.website;
      if (formData.monthlyBudget !== undefined) profileUpdates.monthly_budget_cents = formData.monthlyBudget ? formData.monthlyBudget * 100 : null;
      if (formData.taxId !== undefined) profileUpdates.tax_id = formData.taxId;
      if (formData.billingAddress !== undefined) profileUpdates.billing_address = formData.billingAddress;
      profileUpdates.updated_at = new Date().toISOString();

      if (Object.keys(profileUpdates).length > 1) {
        const { error: profileError } = await supabase
          .from("client_profiles")
          .update(profileUpdates)
          .eq("client_id", clientId);

        if (profileError) throw profileError;
      }

      return { success: true };
    } catch (error) {
      console.error("Error updating client:", error);
      return { success: false, error: error instanceof Error ? error.message : "Erreur lors de la mise à jour du client" };
    }
  }

  /**
   * Update client status
   */
  static async updateClientStatus(clientId: string, status: UserStatus): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", clientId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Error updating client status:", error);
      return { success: false, error: error instanceof Error ? error.message : "Erreur lors de la mise à jour du statut" };
    }
  }

  /**
   * Delete client (soft delete by setting status to banned)
   */
  static async deleteClient(clientId: string): Promise<{ success: boolean; error?: string }> {
    return this.updateClientStatus(clientId, "banned");
  }

  /**
   * Helper: Get campaign statistics for multiple clients
   */
  private static async getClientsCampaignStats(clientIds: string[]): Promise<Map<string, { total: number; spent: number }>> {
    if (clientIds.length === 0) return new Map();

    const supabase = await createClient();
    const { data } = await supabase
      .from("tasks")
      .select("client_id, total_budget_cents, remaining_budget_cents")
      .in("client_id", clientIds);

    const stats = new Map<string, { total: number; spent: number }>();
    data?.forEach(task => {
      const existing = stats.get(task.client_id) || { total: 0, spent: 0 };
      stats.set(task.client_id, {
        total: existing.total + 1,
        spent: existing.spent + (task.total_budget_cents - task.remaining_budget_cents),
      });
    });

    return stats;
  }

  /**
   * Helper: Get wallet statistics for multiple clients
   */
  private static async getClientsWalletStats(clientIds: string[]): Promise<Map<string, { spent: number }>> {
    if (clientIds.length === 0) return new Map();

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("client_wallets")
      .select("client_id, total_spent_cents")
      .in("client_id", clientIds);

    if (error) {
      console.error("Error fetching wallet stats (table may not exist):", error.message);
      return new Map();
    }

    const stats = new Map<string, { spent: number }>();
    data?.forEach(wallet => {
      stats.set(wallet.client_id, { spent: wallet.total_spent_cents || 0 });
    });

    return stats;
  }

  /**
   * Helper: Format currency in FCFA
   */
  private static formatCurrency(cents: number): string {
    const fcfa = Math.floor(cents / 100);
    return `${fcfa.toLocaleString("fr-FR")} FCFA`;
  }

  /**
   * Helper: Format date
   */
  private static formatDate(date: string): string {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  /**
   * Helper: Format relative time
   */
  private static formatRelativeTime(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "Il y a moins d'une minute";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
  }

  /**
   * Helper: Format task type
   */
  private static formatTaskType(type: string): string {
    const typeMap: Record<string, string> = {
      social_follow: "Abonnement",
      social_like: "Like",
      social_share: "Partage",
      social_comment: "Commentaire",
      app_download: "Téléchargement",
      website_visit: "Visite",
      survey: "Sondage",
      review: "Avis",
    };
    return typeMap[type] || type;
  }
}
