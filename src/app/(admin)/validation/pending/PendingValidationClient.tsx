/**
 * PendingValidationClient - Client component for pending validations
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/campaigns/Pagination";
import { approveTask, rejectTask, bulkApproveTasks, bulkRejectTasks } from "@/components/validation/actions";
import type { PendingTaskExecution } from "@/types/validation.types";

interface PendingValidationClientProps {
  initialTasks: PendingTaskExecution[];
  initialPage: number;
  initialTotalPages: number;
}

export default function PendingValidationClient({
  initialTasks,
  initialPage,
  initialTotalPages,
}: PendingValidationClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [taskType, setTaskType] = useState(searchParams.get("type") || "all");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    params.delete("page");

    startTransition(() => {
      router.push(`/validation/pending?${params.toString()}`);
    });
  };

  const handleTypeChange = (value: string) => {
    setTaskType(value);
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set("type", value);
    } else {
      params.delete("type");
    }

    params.delete("page");

    startTransition(() => {
      router.push(`/validation/pending?${params.toString()}`);
    });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());

    startTransition(() => {
      router.push(`/validation/pending?${params.toString()}`);
    });
  };

  const toggleTaskSelection = (executionId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(executionId)
        ? prev.filter((id) => id !== executionId)
        : [...prev, executionId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTasks.length === initialTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(initialTasks.map((t) => t.execution_id));
    }
  };

  const handleApprove = async (executionId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir approuver cette tâche ?")) {
      return;
    }

    const result = await approveTask(executionId);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Erreur lors de la validation");
    }
  };

  const handleReject = async (executionId: string) => {
    const reason = prompt("Raison du rejet :");
    if (!reason) return;

    const result = await rejectTask(executionId, reason);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Erreur lors du rejet");
    }
  };

  const handleBulkApprove = async () => {
    if (selectedTasks.length === 0) {
      alert("Veuillez sélectionner au moins une tâche");
      return;
    }

    if (!confirm(`Approuver ${selectedTasks.length} tâche(s) sélectionnée(s) ?`)) {
      return;
    }

    const result = await bulkApproveTasks(selectedTasks);

    if (result.success) {
      setSelectedTasks([]);
      router.refresh();
    } else {
      alert(result.error || "Erreur lors de la validation en masse");
    }
  };

  const handleBulkReject = async () => {
    if (selectedTasks.length === 0) {
      alert("Veuillez sélectionner au moins une tâche");
      return;
    }

    const reason = prompt("Raison du rejet en masse :");
    if (!reason) return;

    const result = await bulkRejectTasks(selectedTasks, reason);

    if (result.success) {
      setSelectedTasks([]);
      router.refresh();
    } else {
      alert(result.error || "Erreur lors du rejet en masse");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          {selectedTasks.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleBulkApprove}
                className="px-4 py-2 text-sm font-medium text-white bg-success-500 rounded-lg hover:bg-success-600 transition-colors"
              >
                Valider Sélectionnés ({selectedTasks.length})
              </button>
              <button
                type="button"
                onClick={handleBulkReject}
                className="px-4 py-2 text-sm font-medium text-white bg-error-500 rounded-lg hover:bg-error-600 transition-colors"
              >
                Rejeter Sélectionnés ({selectedTasks.length})
              </button>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <select
            value={taskType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
          >
            <option value="all">Tous les types</option>
            <option value="social_follow">Abonnement</option>
            <option value="social_like">Like</option>
            <option value="social_share">Partage</option>
            <option value="social_comment">Commentaire</option>
            <option value="app_download">Téléchargement</option>
            <option value="website_visit">Visite</option>
            <option value="survey">Sondage</option>
            <option value="review">Avis</option>
          </select>

          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {isPending && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
        </div>
      )}

      {!isPending && (
        <>
          {initialTasks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {search || taskType !== "all"
                  ? "Aucune tâche en attente trouvée"
                  : "Aucune tâche en attente de validation"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTasks.length === initialTasks.length}
                            onChange={toggleSelectAll}
                            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                          />
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Exécutant
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Campagne
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Type
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Soumis
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Montant
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {initialTasks.map((task) => (
                        <TableRow key={task.execution_id}>
                          <TableCell className="px-5 py-4 text-start">
                            <input
                              type="checkbox"
                              checked={selectedTasks.includes(task.execution_id)}
                              onChange={() => toggleTaskSelection(task.execution_id)}
                              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            />
                          </TableCell>

                          <TableCell className="px-5 py-4 text-start">
                            <div>
                              <Link
                                href={`/users/executants/${task.executant_id}`}
                                className="font-medium text-gray-800 text-theme-sm dark:text-white/90 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                              >
                                {task.executant_name}
                              </Link>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {task.executant_email}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-3 text-start">
                            <Link
                              href={`/campaigns/${task.campaign_id}`}
                              className="text-gray-700 text-theme-sm dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                            >
                              {task.campaign_title}
                            </Link>
                          </TableCell>

                          <TableCell className="px-4 py-3 text-start">
                            <Badge size="sm" color="info">
                              {task.task_type_label}
                            </Badge>
                          </TableCell>

                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {task.submitted_at_relative}
                          </TableCell>

                          <TableCell className="px-4 py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {task.reward_formatted}
                          </TableCell>

                          <TableCell className="px-4 py-3 text-start">
                            <div className="flex gap-2">
                              <Link
                                href={`/validation/${task.execution_id}`}
                                className="px-3 py-1 text-xs font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20 transition-colors"
                              >
                                Voir Preuve
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleApprove(task.execution_id)}
                                className="px-3 py-1 text-xs font-medium text-success-600 bg-success-50 rounded hover:bg-success-100 dark:bg-success-500/10 dark:text-success-400 dark:hover:bg-success-500/20 transition-colors"
                              >
                                Approuver
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(task.execution_id)}
                                className="px-3 py-1 text-xs font-medium text-error-600 bg-error-50 rounded hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 dark:hover:bg-error-500/20 transition-colors"
                              >
                                Rejeter
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Pagination
                currentPage={initialPage}
                totalPages={initialTotalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
