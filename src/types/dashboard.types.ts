/**
 * Dashboard Statistics Types
 */

export interface DashboardStats {
  activeCampaigns: number;
  activeCampaignsTrend: number;
  tasksCompleted: number;
  tasksCompletedTrend: number;
  pendingValidations: number;
  totalRevenue: number;
  totalRevenueTrend: number;
}

export interface RecentTask {
  id: string;
  executant: string;
  executantId: string;
  campaign: string;
  campaignId: string;
  type: string;
  amount: number;
  status: "Validé" | "En attente" | "Rejeté";
  date: string;
  submittedAt: string;
}

export interface PlatformMetrics {
  totalUsers: number;
  totalClients: number;
  totalExecutants: number;
  activeUsers24h: number;
  validationRate: number;
  averageTaskCompletionTime: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  tasksCompleted: number;
}
