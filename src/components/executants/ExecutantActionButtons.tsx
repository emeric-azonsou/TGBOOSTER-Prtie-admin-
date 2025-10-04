/**
 * ExecutantActionButtons - Action buttons for executant management
 * Client component with loading states for suspend/verify/delete actions
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ExecutantActionButtonsProps {
  executantId: string;
  currentStatus: string;
  isVerified: boolean;
  onSuspend: (formData: FormData) => Promise<void>;
  onVerify: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
}

export default function ExecutantActionButtons({
  executantId,
  currentStatus,
  isVerified,
  onSuspend,
  onVerify,
  onDelete,
}: ExecutantActionButtonsProps) {
  const router = useRouter();
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSuspend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuspendLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await onSuspend(formData);
      router.refresh();
    } catch (error) {
      console.error("Error suspending executant:", error);
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVerifyLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await onVerify(formData);
      router.refresh();
    } catch (error) {
      console.error("Error verifying executant:", error);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !confirm(
        "Êtes-vous sûr de vouloir bloquer cet exécutant ? Cette action est irréversible."
      )
    ) {
      return;
    }

    setDeleteLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await onDelete(formData);
    } catch (error) {
      console.error("Error deleting executant:", error);
      setDeleteLoading(false);
    }
  };

  const isProcessing = suspendLoading || verifyLoading || deleteLoading;

  return (
    <div className="flex gap-3 pt-4">
      {!isVerified && (
        <form onSubmit={handleVerify}>
          <input type="hidden" name="executantId" value={executantId} />
          <button
            type="submit"
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-white bg-success-500 rounded-lg hover:bg-success-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {verifyLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <title>Chargement</title>
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Vérification...
              </>
            ) : (
              "Vérifier l&apos;identité"
            )}
          </button>
        </form>
      )}

      <form onSubmit={handleSuspend}>
        <input type="hidden" name="executantId" value={executantId} />
        <button
          type="submit"
          disabled={isProcessing}
          className="px-4 py-2 text-sm font-medium text-white bg-warning-500 rounded-lg hover:bg-warning-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {suspendLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <title>Chargement</title>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Traitement...
            </>
          ) : currentStatus === "suspended" ? (
            "Réactiver"
          ) : (
            "Suspendre"
          )}
        </button>
      </form>

      <form onSubmit={handleDelete}>
        <input type="hidden" name="executantId" value={executantId} />
        <button
          type="submit"
          disabled={isProcessing}
          className="px-4 py-2 text-sm font-medium text-white bg-error-500 rounded-lg hover:bg-error-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {deleteLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <title>Chargement</title>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Blocage...
            </>
          ) : (
            "Bloquer"
          )}
        </button>
      </form>
    </div>
  );
}
