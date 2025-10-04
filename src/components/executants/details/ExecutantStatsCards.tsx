/**
 * ExecutantStatsCards - Displays executant statistics in card format
 */

import ComponentCard from "@/components/common/ComponentCard";
import type { ExecutantStats } from "@/types/executant.types";

interface ExecutantStatsCardsProps {
  stats: ExecutantStats;
}

export default function ExecutantStatsCards({ stats }: ExecutantStatsCardsProps) {
  return (
    <ComponentCard title="Statistiques">
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-success-50 dark:bg-success-500/10">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Total Gagné
          </p>
          <p className="text-2xl font-bold text-success-600 dark:text-success-400">
            {stats.totalEarnedFormatted}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Disponible: {stats.accountBalanceFormatted}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-brand-50 dark:bg-brand-500/10">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Tâches Complétées
          </p>
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
            {stats.totalTasksCompleted}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.activeTasks} en cours
          </p>
        </div>

        <div className="p-4 rounded-lg bg-warning-50 dark:bg-warning-500/10">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Taux de Réussite
          </p>
          <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
            {stats.successRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Note: {stats.averageRating.toFixed(1)}/5
          </p>
        </div>

        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-500/10">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Abonnement
          </p>
          <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
            {stats.subscriptionStatus === "active" ? "Actif" : stats.subscriptionStatus === "expired" ? "Expiré" : "Aucun"}
          </p>
          {stats.subscriptionExpiry && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Expire: {stats.subscriptionExpiry}
            </p>
          )}
        </div>

        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-500/10">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Membre depuis
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {stats.memberSince}
          </p>
          {stats.lastActive && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Dernier: {stats.lastActive}
            </p>
          )}
        </div>
      </div>
    </ComponentCard>
  );
}
