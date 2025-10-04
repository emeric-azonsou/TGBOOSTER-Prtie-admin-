import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { WithdrawalService } from "@/services/withdrawal.service";

export const metadata: Metadata = {
  title: "Retraits En Attente | Admin - TikTok Visibility Platform",
  description: "Gestion des demandes de retrait",
};

export const revalidate = 30; // Revalider toutes les 30 secondes

const getStatusBadgeColor = (
  status: string
): "success" | "warning" | "error" | "light" => {
  switch (status) {
    case "completed":
      return "success";
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "error";
    default:
      return "light";
  }
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: "En attente",
    approved: "Approuvé",
    rejected: "Rejeté",
    completed: "Complété",
  };
  return labels[status] || status;
};

const getPaymentMethodLabel = (method: string, provider?: string): string => {
  if (method === "mobile_money" && provider) {
    const providers: Record<string, string> = {
      mtn_momo: "MTN MoMo",
      moov_money: "Moov Money",
      celtiis_cash: "Celtiis Cash",
    };
    return providers[provider] || provider;
  }
  const methods: Record<string, string> = {
    card: "Carte bancaire",
    mobile_money: "Mobile Money",
    bank_transfer: "Virement bancaire",
    paypal: "PayPal",
  };
  return methods[method] || method;
};

export default async function WithdrawalsPage() {
  const withdrawalsData = await WithdrawalService.getWithdrawals({
    status: "pending",
    page: 1,
    limit: 50,
    sortBy: "date",
    sortOrder: "desc",
  });
  return (
    <div>
      <PageBreadcrumb pageTitle="Demandes de Retrait" />
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <ComponentCard title="En Attente">
            <div className="text-3xl font-bold text-warning-600 dark:text-warning-400">
              {withdrawalsData.stats.totalPending}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {withdrawalsData.stats.pendingAmountFormatted}
            </p>
          </ComponentCard>

          <ComponentCard title="Approuvés">
            <div className="text-3xl font-bold text-success-600 dark:text-success-400">
              {withdrawalsData.stats.totalApproved}
            </div>
          </ComponentCard>

          <ComponentCard title="Rejetés">
            <div className="text-3xl font-bold text-error-600 dark:text-error-400">
              {withdrawalsData.stats.totalRejected}
            </div>
          </ComponentCard>

          <ComponentCard title="Temps Moyen">
            <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">
              {withdrawalsData.stats.averageProcessingTimeHours
                ? `${withdrawalsData.stats.averageProcessingTimeHours.toFixed(1)}h`
                : "N/A"}
            </div>
          </ComponentCard>
        </div>
        <ComponentCard title="Retraits en attente de traitement">
          <div className="w-full">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
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
                    Montant
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Méthode
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Statut
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
                {withdrawalsData.withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.withdrawal_id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {withdrawal.executant_name}
                      </span>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {withdrawal.requested_at_relative}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {withdrawal.amount_formatted}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <span className="block">
                        {getPaymentMethodLabel(withdrawal.payment_method, withdrawal.mobile_money_provider)}
                      </span>
                      <span className="text-theme-xs">
                        {withdrawal.mobile_money_number || withdrawal.bank_account_number}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color={getStatusBadgeColor(withdrawal.status)}>
                        {getStatusLabel(withdrawal.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex gap-2">
                        <Link
                          href={`/finances/withdrawals/${withdrawal.withdrawal_id}`}
                          className="px-3 py-1 text-xs font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 transition-colors"
                        >
                          Vérifier
                        </Link>
                      </div>
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
