/**
 * ExecutantProfileHeader - Displays executant profile information and actions
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import type { ExecutantWithProfile } from "@/types/executant.types";
import type { BadgeColor } from "@/components/ui/badge/Badge";
import { suspendExecutant, verifyExecutant } from "../actions";

interface ExecutantProfileHeaderProps {
  executant: ExecutantWithProfile;
}

export default function ExecutantProfileHeader({
  executant,
}: ExecutantProfileHeaderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { user, profile } = executant;

  if (!profile) {
    return (
      <ComponentCard title="Informations Générales">
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Profil exécutant non disponible
          </p>
        </div>
      </ComponentCard>
    );
  }

  const getStatusColor = (
    status: string
  ): BadgeColor => {
    switch (status) {
      case "active":
        return "success";
      case "pending_verification":
        return "warning";
      case "suspended":
        return "error";
      case "banned":
        return "error";
      default:
        return "light";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "active":
        return "Actif";
      case "pending_verification":
        return "En attente";
      case "suspended":
        return "Suspendu";
      case "banned":
        return "Banni";
      default:
        return status;
    }
  };

  const handleVerify = async () => {
    if (!confirm("Êtes-vous sûr de vouloir vérifier cet exécutant ?")) return;

    setIsLoading(true);
    try {
      await verifyExecutant(user.id);
      router.refresh();
    } catch (error) {
      console.error("Error verifying executant:", error);
      alert("Erreur lors de la vérification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async () => {
    const action = user.status === "suspended" ? "réactiver" : "suspendre";
    if (!confirm(`Êtes-vous sûr de vouloir ${action} cet exécutant ?`)) return;

    setIsLoading(true);
    try {
      await suspendExecutant(user.id);
      router.refresh();
    } catch (error) {
      console.error("Error suspending executant:", error);
      alert(`Erreur lors de ${action === "réactiver" ? "la réactivation" : "la suspension"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const tiktokHandle =
    (profile.social_media_accounts as Record<string, unknown>)?.tiktok as
      | { username?: string }
      | undefined;

  return (
    <ComponentCard title="Informations Générales">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                {user.first_name} {user.last_name}
              </h3>
              {profile.is_verified && (
                <Badge size="sm" color="success">
                  Vérifié
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
            {tiktokHandle?.username && (
              <p className="text-sm text-brand-500">@{tiktokHandle.username}</p>
            )}
          </div>
          <Badge size="sm" color={getStatusColor(user.status)}>
            {getStatusLabel(user.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Téléphone
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {user.phone || "Non renseigné"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Niveau de vérification
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {profile.verification_level || "Aucun"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Taux de réussite
            </p>
            <p className="text-sm font-medium text-success-600 dark:text-success-400">
              {profile.success_rate?.toFixed(1) || 0}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Note moyenne
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {profile.rating_avg?.toFixed(1) || 0}/5
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-4">
          {!profile.is_verified && (
            <button
              type="button"
              onClick={handleVerify}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-success-500 rounded-lg hover:bg-success-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Valider Identité
            </button>
          )}
          <button
            type="button"
            onClick={handleSuspend}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              user.status === "suspended"
                ? "bg-success-500 hover:bg-success-600"
                : "bg-warning-500 hover:bg-warning-600"
            }`}
          >
            {user.status === "suspended" ? "Réactiver" : "Suspendre"}
          </button>
        </div>
      </div>
    </ComponentCard>
  );
}
