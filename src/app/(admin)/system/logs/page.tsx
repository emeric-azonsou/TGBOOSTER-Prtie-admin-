import type { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LogsTable from "@/components/system/LogsTable";
import { getAdminLogs, getSystemMetrics } from "@/app/actions/system.actions";

export const metadata: Metadata = {
  title: "Logs d'Activité | Admin - TikTok Visibility Platform",
  description: "Journal des activités administratives",
};

export default async function LogsPage() {
  const logsResponse = await getAdminLogs({}, { page: 1, limit: 50 });
  const metricsResponse = await getSystemMetrics();

  const logs = logsResponse.success ? logsResponse.data?.data || [] : [];
  const pagination = logsResponse.success
    ? logsResponse.data?.pagination || {
        page: 1,
        limit: 50,
        total: 0,
        total_pages: 0,
      }
    : { page: 1, limit: 50, total: 0, total_pages: 0 };
  const metrics = metricsResponse.success ? metricsResponse.data : null;

  return (
    <div>
      <PageBreadcrumb pageTitle="Logs d'Activité Admin" />
      <div className="space-y-6">
        {metrics && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="text-center">
                <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                  Total Logs
                </p>
                <p className="mt-2 font-bold text-gray-900 text-theme-2xl dark:text-white">
                  {metrics.total_logs.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="text-center">
                <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                  Logs Aujourd&apos;hui
                </p>
                <p className="mt-2 font-bold text-gray-900 text-theme-2xl dark:text-white">
                  {metrics.logs_today.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="text-center">
                <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                  Admins Actifs
                </p>
                <p className="mt-2 font-bold text-gray-900 text-theme-2xl dark:text-white">
                  {metrics.active_admins}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="text-center">
                <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                  Temps Réponse Moyen
                </p>
                <p className="mt-2 font-bold text-gray-900 text-theme-2xl dark:text-white">
                  {metrics.avg_response_time_ms}ms
                </p>
              </div>
            </div>
          </div>
        )}

        <LogsTable initialLogs={logs} initialPagination={pagination} />
      </div>
    </div>
  );
}
