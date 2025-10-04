/**
 * Pending Validation Page - Task executions awaiting manual validation
 */

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PendingValidationClient from "./PendingValidationClient";
import { ValidationService } from "@/services/validation.service";
import type { Metadata } from "next";
import { formatRelativeTime } from "@/lib/utils/formatters";

export const metadata: Metadata = {
  title: "Validations En Attente | Admin - TikTok Visibility Platform",
  description: "Tâches en attente de validation manuelle",
};

export const revalidate = 20; // Revalider toutes les 20 secondes

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    type?: string;
  }>;
}

export default async function PendingValidationPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const type = params.type || "all";

  const [{ tasks, total, totalPages }, stats] = await Promise.all([
    ValidationService.getPendingTasks({
      page,
      limit: 20,
      search,
      taskType: type as any,
      sortBy: "submittedDate",
      sortOrder: "asc",
    }),
    ValidationService.getValidationStats(),
  ]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Validations En Attente" />
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="px-4 py-3 bg-warning-50 dark:bg-warning-500/10 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              En Attente
            </p>
            <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
              {stats.pendingCount}
            </p>
          </div>

          <div className="px-4 py-3 bg-success-50 dark:bg-success-500/10 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Validées Aujourd'hui
            </p>
            <p className="text-2xl font-bold text-success-600 dark:text-success-400">
              {stats.approvedToday}
            </p>
          </div>

          <div className="px-4 py-3 bg-error-50 dark:bg-error-500/10 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Rejetées Aujourd'hui
            </p>
            <p className="text-2xl font-bold text-error-600 dark:text-error-400">
              {stats.rejectedToday}
            </p>
          </div>

          <div className="px-4 py-3 bg-info-50 dark:bg-info-500/10 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Temps Moyen
            </p>
            <p className="text-2xl font-bold text-info-600 dark:text-info-400">
              {stats.averageProcessingTime
                ? `${Math.round(stats.averageProcessingTime)}min`
                : "-"}
            </p>
          </div>
        </div>

        {stats.oldestPending && (
          <div className="px-4 py-3 bg-orange-50 dark:bg-orange-500/10 rounded-lg border border-orange-200 dark:border-orange-500/20">
            <p className="text-sm text-orange-700 dark:text-orange-400">
              ⚠️ Plus ancienne tâche en attente :{" "}
              <span className="font-semibold">
                {formatRelativeTime(stats.oldestPending)}
              </span>
            </p>
          </div>
        )}

        <ComponentCard title="Tâches à valider manuellement">
          <PendingValidationClient
            initialTasks={tasks}
            initialPage={page}
            initialTotal={total}
            initialTotalPages={totalPages}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
