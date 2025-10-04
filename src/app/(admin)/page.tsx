import type { Metadata } from "next";
import React, { Suspense } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import LineChartOne from "@/components/charts/line/LineChartOne";
import StatCard from "@/components/dashboard/StatCard";
import FinancialStatsCard from "@/components/dashboard/FinancialStatsCard";
import RecentTasksTable from "@/components/dashboard/RecentTasksTable";
import { DashboardService } from "@/services/dashboard.service";

export const metadata: Metadata = {
  title: "Vue d'ensemble | Admin - TikTok Visibility Platform",
  description: "Tableau de bord administrateur",
};

export const revalidate = 20; // Revalider toutes les 20 secondes

async function DashboardStats() {
  const stats = await DashboardService.getDashboardStats();

  const formatRevenue = (cents: number) => {
    const millions = cents / 100000000;
    if (millions >= 1) {
      return `${millions.toFixed(1)}M`;
    }
    const thousands = cents / 100000;
    return `${thousands.toFixed(0)}K`;
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
      <StatCard
        title="Campagnes Actives"
        value={stats.activeCampaigns}
        trend={stats.activeCampaignsTrend}
        icon="📊"
        iconBgColor="bg-brand-50 dark:bg-brand-500/10"
        trendLabel="ce mois"
      />

      <StatCard
        title="Tâches Complétées"
        value={stats.tasksCompleted.toLocaleString()}
        trend={stats.tasksCompletedTrend}
        icon="✅"
        iconBgColor="bg-success-50 dark:bg-success-500/10"
        trendLabel="cette semaine"
      />

      <StatCard
        title="Validations En Attente"
        value={stats.pendingValidations}
        icon="⏳"
        iconBgColor="bg-warning-50 dark:bg-warning-500/10"
      />

      <StatCard
        title="Revenus Total (FCFA)"
        value={formatRevenue(stats.totalRevenue)}
        trend={stats.totalRevenueTrend}
        icon="💰"
        iconBgColor="bg-error-50 dark:bg-error-500/10"
        trendLabel="ce mois"
      />
    </div>
  );
}

async function RecentTasks() {
  const tasks = await DashboardService.getRecentTasks(10);

  return <RecentTasksTable tasks={tasks} />;
}

async function FinancialStats() {
  const stats = await DashboardService.getFinancialStats();

  const formatMoney = (cents: number) => {
    return (cents / 100).toLocaleString("fr-FR");
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
      <FinancialStatsCard
        title="Dépôts Totaux"
        value={`${formatMoney(stats.totalDeposits)} FCFA`}
        subtitle="Tous les dépôts clients"
        icon="💵"
        bgColor="bg-success-50 dark:bg-success-500/10"
        textColor="text-success-600 dark:text-success-400"
      />

      <FinancialStatsCard
        title="Paiements Effectués"
        value={`${formatMoney(stats.totalPayouts)} FCFA`}
        subtitle="Versés aux exécutants"
        icon="💸"
        bgColor="bg-warning-50 dark:bg-warning-500/10"
        textColor="text-warning-600 dark:text-warning-400"
      />

      <FinancialStatsCard
        title="Bénéfice Net"
        value={`${formatMoney(stats.platformProfit)} FCFA`}
        subtitle="Commission plateforme"
        icon="💰"
        bgColor="bg-brand-50 dark:bg-brand-500/10"
        textColor="text-brand-600 dark:text-brand-400"
      />

      <FinancialStatsCard
        title="Retraits en Attente"
        value={`${formatMoney(stats.pendingWithdrawalAmount)} FCFA`}
        subtitle="À traiter"
        icon="⏳"
        bgColor="bg-error-50 dark:bg-error-500/10"
        textColor="text-error-600 dark:text-error-400"
      />
    </div>
  );
}

async function UserStats() {
  const stats = await DashboardService.getFinancialStats();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="px-6 py-4 bg-blue-light-50 dark:bg-blue-light-500/10 rounded-xl border border-blue-light-200 dark:border-blue-light-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Clients Actifs</p>
            <p className="text-3xl font-bold text-blue-light-600 dark:text-blue-light-400">{stats.activeClients}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-light-100 dark:bg-blue-light-500/20">
            <span className="text-3xl">👥</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-200 dark:border-orange-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Exécutants Actifs</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.activeExecutants}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-500/20">
            <span className="text-3xl">🚀</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700" />
          </div>
          <div>
            <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-20 mb-2" />
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TableLoading() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-8 space-y-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/4" />
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/3" />
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/6" />
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/6" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Statistiques Opérationnelles */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Statistiques Opérationnelles
        </h2>
        <Suspense fallback={<StatsLoading />}>
          <DashboardStats />
        </Suspense>
      </div>

      {/* Statistiques Financières */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Finances de la Plateforme
        </h2>
        <Suspense fallback={<StatsLoading />}>
          <FinancialStats />
        </Suspense>
      </div>

      {/* Statistiques Utilisateurs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          👥 Utilisateurs Actifs
        </h2>
        <Suspense fallback={<div className="animate-pulse h-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />}>
          <UserStats />
        </Suspense>
      </div>

      {/* Graphique d'Activité */}
      <ComponentCard title="Activité de la Plateforme">
        <LineChartOne />
      </ComponentCard>

      {/* Tâches Récentes */}
      <ComponentCard title="Tâches Récentes">
        <Suspense fallback={<TableLoading />}>
          <RecentTasks />
        </Suspense>
      </ComponentCard>
    </div>
  );
}
