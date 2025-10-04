/**
 * ValidationActions - Actions for approving/rejecting tasks
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveTask, rejectTask } from "./actions";
import type { PendingTaskExecution } from "@/types/validation.types";

interface ValidationActionsProps {
  task: PendingTaskExecution;
}

export default function ValidationActions({ task }: ValidationActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [rating, setRating] = useState<number>(0);

  const handleApprove = async () => {
    if (!confirm("Êtes-vous sûr de vouloir approuver cette tâche ?")) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await approveTask(
        task.execution_id,
        rating > 0 ? rating : undefined,
        undefined,
        reviewNotes || undefined
      );

      if (result.success) {
        alert("Tâche approuvée avec succès !");
        router.push("/validation/pending");
        router.refresh();
      } else {
        alert(result.error || "Erreur lors de la validation");
      }
    } catch (error) {
      console.error("Error approving task:", error);
      alert("Erreur lors de la validation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt("Raison du rejet (obligatoire) :");
    if (!reason) return;

    setIsLoading(true);

    try {
      const result = await rejectTask(
        task.execution_id,
        reason,
        reviewNotes || undefined
      );

      if (result.success) {
        alert("Tâche rejetée avec succès !");
        router.push("/validation/pending");
        router.refresh();
      } else {
        alert(result.error || "Erreur lors du rejet");
      }
    } catch (error) {
      console.error("Error rejecting task:", error);
      alert("Erreur lors du rejet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/validation/pending");
  };

  return (
    <div className="space-y-4">
      {/* Rating */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Note (optionnel, de 1 à 5)
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition-colors ${
                star <= rating
                  ? "text-yellow-500"
                  : "text-gray-300 dark:text-gray-600 hover:text-yellow-400"
              }`}
            >
              ★
            </button>
          ))}
          {rating > 0 && (
            <button
              type="button"
              onClick={() => setRating(0)}
              className="ml-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Review notes */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Notes de Validation (optionnel)
        </label>
        <textarea
          rows={3}
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.target.value)}
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
          placeholder="Ajouter des notes ou commentaires internes..."
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 pt-4">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isLoading}
          className="px-6 py-2.5 text-sm font-medium text-white bg-success-500 rounded-lg hover:bg-success-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✓ Approuver la Preuve
        </button>

        <button
          type="button"
          onClick={handleReject}
          disabled={isLoading}
          className="px-6 py-2.5 text-sm font-medium text-white bg-error-500 rounded-lg hover:bg-error-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✗ Rejeter la Preuve
        </button>

        <button
          type="button"
          onClick={handleBack}
          disabled={isLoading}
          className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Retour à la Liste
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500" />
          Traitement en cours...
        </div>
      )}
    </div>
  );
}
