"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface WithdrawalProcessFormProps {
  withdrawalId: string;
}

export default function WithdrawalProcessForm({
  withdrawalId,
}: WithdrawalProcessFormProps) {
  const router = useRouter();
  const [action, setAction] = useState<"approve" | "reject" | "hold" | "">(
    ""
  );
  const [externalTransactionId, setExternalTransactionId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!action) {
      setError("Veuillez sélectionner une action");
      return;
    }

    if (action === "approve" && !externalTransactionId) {
      setError("Veuillez entrer l'ID de transaction externe");
      return;
    }

    if (action === "reject" && !rejectionReason) {
      setError("Veuillez entrer la raison du rejet");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/withdrawals/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          withdrawal_id: withdrawalId,
          action,
          external_transaction_id:
            action === "approve" ? externalTransactionId : undefined,
          rejection_reason: action === "reject" ? rejectionReason : undefined,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du traitement");
      }

      router.push("/finances/withdrawals");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du traitement"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-lg dark:bg-error-500/10 dark:border-error-500/20">
          <p className="text-sm text-error-800 dark:text-error-400">{error}</p>
        </div>
      )}

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Action
        </label>
        <select
          value={action}
          onChange={(e) =>
            setAction(e.target.value as "approve" | "reject" | "hold" | "")
          }
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          disabled={isSubmitting}
        >
          <option value="">Sélectionnez une action</option>
          <option value="approve">Approuver et Traiter</option>
          <option value="reject">Rejeter la Demande</option>
          <option value="hold">Mettre en Attente</option>
        </select>
      </div>

      {action === "approve" && (
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            ID de Transaction PawaPay <span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            value={externalTransactionId}
            onChange={(e) => setExternalTransactionId(e.target.value)}
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Ex: PAWA-123456789"
            disabled={isSubmitting}
          />
        </div>
      )}

      {action === "reject" && (
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Raison du Rejet <span className="text-error-500">*</span>
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Expliquez pourquoi la demande est rejetée..."
            disabled={isSubmitting}
          />
        </div>
      )}

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Notes (optionnel)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Ajouter des notes sur le traitement..."
          disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-4 pt-4">
        {action === "approve" && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-success-500 rounded-lg hover:bg-success-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Traitement..." : "Approuver le Retrait"}
          </button>
        )}
        {action === "reject" && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-error-500 rounded-lg hover:bg-error-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Traitement..." : "Rejeter"}
          </button>
        )}
        {action === "hold" && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-warning-500 rounded-lg hover:bg-warning-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Traitement..." : "Mettre en Attente"}
          </button>
        )}
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
