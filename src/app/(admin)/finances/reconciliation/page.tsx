import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { ReconciliationService } from "@/services/reconciliation.service";

export const metadata: Metadata = {
  title: "Rapprochements | Admin - TikTok Visibility Platform",
  description: "Rapprochements bancaires et financiers",
};

export const revalidate = 30; // Revalider toutes les 30 secondes

const getStatusBadgeColor = (
  status: string
): "success" | "warning" | "error" | "light" => {
  switch (status) {
    case "matched":
      return "success";
    case "pending":
      return "warning";
    case "mismatch":
      return "error";
    default:
      return "light";
  }
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    matched: "Concordant",
    mismatch: "Écart",
    pending: "En attente",
  };
  return labels[status] || status;
};

export default async function ReconciliationPage() {
  const reconciliationData = await ReconciliationService.getReconciliations({
    page: 1,
    limit: 50,
    sortBy: "date",
    sortOrder: "desc",
  });
  return (
    <div>
      <PageBreadcrumb pageTitle="Rapprochements Financiers" />
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <ComponentCard title="Concordants">
            <div className="text-3xl font-bold text-success-600 dark:text-success-400">
              {reconciliationData.stats.totalMatched}
            </div>
          </ComponentCard>

          <ComponentCard title="Écarts">
            <div className="text-3xl font-bold text-error-600 dark:text-error-400">
              {reconciliationData.stats.totalMismatch}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {reconciliationData.stats.totalDifferenceFormatted}
            </p>
          </ComponentCard>

          <ComponentCard title="En Attente">
            <div className="text-3xl font-bold text-warning-600 dark:text-warning-400">
              {reconciliationData.stats.totalPending}
            </div>
          </ComponentCard>

          <ComponentCard title="Total Rapprochements">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {reconciliationData.total}
            </div>
          </ComponentCard>
        </div>

        <ComponentCard title="Rapprochements bancaires">
          <div className="w-full">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Fournisseur
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Montant Interne
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Montant Externe
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Écart
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Statut
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {reconciliationData.reconciliations.map((item) => (
                  <TableRow key={item.reconciliation_id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {item.provider_name}
                      </span>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {new Date(item.period_start).toLocaleDateString()} - {new Date(item.period_end).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.internal_amount_formatted}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.external_amount_formatted}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <span className={item.difference_cents !== 0 ? "text-error-600 dark:text-error-400 font-medium" : ""}>
                        {item.difference_cents !== 0 ? item.difference_formatted : "0 FCFA"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color={getStatusBadgeColor(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
