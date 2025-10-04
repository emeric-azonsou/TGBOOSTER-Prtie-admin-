/**
 * CampaignStats - Campaign statistics display
 */

import ComponentCard from "@/components/common/ComponentCard";
import type { Campaign, CampaignStats as Stats } from "@/types/campaign.types";

interface CampaignStatsProps {
  campaign: Campaign;
  stats: Stats;
}

export default function CampaignStats({ campaign, stats }: CampaignStatsProps) {
  const spentCents = campaign.total_budget_cents - campaign.remaining_budget_cents;
  const budgetFormatted = Math.floor(campaign.total_budget_cents / 100).toLocaleString("fr-FR");
  const spentFormatted = Math.floor(spentCents / 100).toLocaleString("fr-FR");
  const remainingFormatted = Math.floor(campaign.remaining_budget_cents / 100).toLocaleString("fr-FR");

  return (
    <ComponentCard title="Statistiques">
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-brand-50 dark:bg-brand-500/10">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Budget Total
          </p>
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
            {budgetFormatted} FCFA
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Dépensé: <span className="font-medium text-gray-700 dark:text-gray-300">{spentFormatted} FCFA</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Restant: <span className="font-medium text-gray-700 dark:text-gray-300">{remainingFormatted} FCFA</span>
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-success-50 dark:bg-success-500/10">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Actions Complétées
          </p>
          <p className="text-2xl font-bold text-success-600 dark:text-success-400">
            {campaign.quantity_completed}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Objectif: {campaign.quantity_required}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-info-50 dark:bg-info-500/10">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Taux de Réussite
          </p>
          <p className="text-2xl font-bold text-info-600 dark:text-info-400">
            {stats.successRate}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.completedExecutions} / {stats.totalExecutions} exécutions
          </p>
        </div>

        <div className="p-4 rounded-lg bg-warning-50 dark:bg-warning-500/10">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            En Attente
          </p>
          <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
            {stats.pendingExecutions}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Exécutions à valider
          </p>
        </div>

        {stats.averageRating > 0 && (
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-500/10">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Note Moyenne
            </p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.averageRating}/5
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Satisfaction exécutants
            </p>
          </div>
        )}
      </div>
    </ComponentCard>
  );
}
