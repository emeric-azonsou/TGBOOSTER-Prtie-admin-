/**
 * CampaignHeader - Campaign details header with actions
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import type { BadgeColor } from "@/components/ui/badge/Badge";
import type { CampaignDetails } from "@/types/campaign.types";
import {
  pauseCampaign,
  resumeCampaign,
  cancelCampaign,
} from "@/components/campaigns/actions";

interface CampaignHeaderProps {
  campaign: CampaignDetails;
}

export default function CampaignHeader({ campaign }: CampaignHeaderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: string): BadgeColor => {
    switch (status) {
      case "active":
        return "success";
      case "draft":
        return "light";
      case "paused":
        return "warning";
      case "completed":
        return "info";
      case "cancelled":
        return "error";
      default:
        return "light";
    }
  };

  const getTypeColor = (): BadgeColor => "info";

  const handlePause = async () => {
    if (!confirm("Êtes-vous sûr de vouloir mettre en pause cette campagne ?")) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await pauseCampaign(campaign.task_id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Erreur lors de la mise en pause");
      }
    } catch (error) {
      console.error("Error pausing campaign:", error);
      alert("Erreur lors de la mise en pause");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = async () => {
    if (!confirm("Êtes-vous sûr de vouloir reprendre cette campagne ?")) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await resumeCampaign(campaign.task_id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Erreur lors de la reprise");
      }
    } catch (error) {
      console.error("Error resuming campaign:", error);
      alert("Erreur lors de la reprise");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir annuler cette campagne ? Cette action est irréversible."
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await cancelCampaign(campaign.task_id);
      if (result.success) {
        router.push("/campaigns/all");
      } else {
        alert(result.error || "Erreur lors de l'annulation");
      }
    } catch (error) {
      console.error("Error cancelling campaign:", error);
      alert("Erreur lors de l'annulation");
    } finally {
      setIsLoading(false);
    }
  };

  const progress = campaign.quantity_required > 0
    ? Math.round((campaign.quantity_completed / campaign.quantity_required) * 100)
    : 0;

  return (
    <ComponentCard title="Informations Générales">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
              {campaign.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Par {campaign.client.first_name} {campaign.client.last_name}
              {campaign.client.company_name && (
                <span className="ml-1">({campaign.client.company_name})</span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge size="sm" color={getStatusColor(campaign.status)}>
              {campaign.status === "draft" && "Brouillon"}
              {campaign.status === "active" && "Active"}
              {campaign.status === "paused" && "En pause"}
              {campaign.status === "completed" && "Terminée"}
              {campaign.status === "cancelled" && "Annulée"}
            </Badge>
            <Badge size="sm" color={getTypeColor()}>
              {campaign.task_type === "social_follow" && "Abonnement"}
              {campaign.task_type === "social_like" && "Like"}
              {campaign.task_type === "social_share" && "Partage"}
              {campaign.task_type === "social_comment" && "Commentaire"}
              {campaign.task_type === "app_download" && "Téléchargement"}
              {campaign.task_type === "website_visit" && "Visite"}
              {campaign.task_type === "survey" && "Sondage"}
              {campaign.task_type === "review" && "Avis"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              URL Cible
            </p>
            <a
              href={campaign.target_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-brand-500 hover:text-brand-600 break-all"
            >
              {campaign.target_url}
            </a>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Priorité
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {campaign.priority === "low" && "Basse"}
              {campaign.priority === "normal" && "Normale"}
              {campaign.priority === "high" && "Haute"}
              {campaign.priority === "urgent" && "Urgente"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Date de Début
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {new Date(campaign.start_date).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Date de Fin
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {campaign.end_date
                ? new Date(campaign.end_date).toLocaleDateString("fr-FR")
                : "Non définie"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Récompense par Action
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {Math.floor(campaign.reward_per_execution_cents / 100).toLocaleString("fr-FR")} FCFA
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Progression
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  className="h-2 bg-brand-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-white/90 min-w-[3rem]">
                {progress}%
              </span>
            </div>
          </div>
        </div>

        {campaign.instructions && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Instructions
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {campaign.instructions}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          {campaign.status === "active" && (
            <button
              type="button"
              onClick={handlePause}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-warning-500 rounded-lg hover:bg-warning-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mettre en Pause
            </button>
          )}
          {campaign.status === "paused" && (
            <button
              type="button"
              onClick={handleResume}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-success-500 rounded-lg hover:bg-success-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reprendre
            </button>
          )}
          {(campaign.status === "active" || campaign.status === "paused") && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-error-500 rounded-lg hover:bg-error-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </ComponentCard>
  );
}
