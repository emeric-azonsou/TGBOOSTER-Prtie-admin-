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
import { TransactionService } from "@/services/transaction.service";

export const metadata: Metadata = {
  title: "Transactions | Admin - TikTok Visibility Platform",
  description: "Historique des transactions financières",
};

export const revalidate = 30; // Revalider toutes les 30 secondes

const getStatusBadgeColor = (
  status: string
): "success" | "warning" | "error" | "light" => {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "failed":
    case "cancelled":
      return "error";
    default:
      return "light";
  }
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    completed: "Complété",
    pending: "En attente",
    failed: "Échoué",
    cancelled: "Annulé",
  };
  return labels[status] || status;
};

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    deposit: "Dépôt",
    withdrawal: "Retrait",
    payment: "Paiement",
    refund: "Remboursement",
    commission: "Commission",
  };
  return labels[type] || type;
};

export default async function TransactionsPage() {
  const transactionsData = await TransactionService.getTransactions({
    page: 1,
    limit: 50,
    sortBy: "date",
    sortOrder: "desc",
  });
  return (
    <div>
      <PageBreadcrumb pageTitle="Transactions Financières" />
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <ComponentCard title="Total Dépôts">
            <div className="text-3xl font-bold text-success-600 dark:text-success-400">
              {(transactionsData.stats.totalDeposits / 100).toLocaleString()} FCFA
            </div>
          </ComponentCard>

          <ComponentCard title="Total Retraits">
            <div className="text-3xl font-bold text-warning-600 dark:text-warning-400">
              {(transactionsData.stats.totalWithdrawals / 100).toLocaleString()} FCFA
            </div>
          </ComponentCard>

          <ComponentCard title="Montant en Attente">
            <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">
              {(transactionsData.stats.pendingAmount / 100).toLocaleString()} FCFA
            </div>
          </ComponentCard>

          <ComponentCard title="Montant Complété">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {(transactionsData.stats.completedAmount / 100).toLocaleString()} FCFA
            </div>
          </ComponentCard>
        </div>

        <ComponentCard title="Historique des transactions">
          <div className="w-full">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Utilisateur
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
                    Montant
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
                {transactionsData.transactions.map((transaction) => (
                  <TableRow key={transaction.transaction_id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {transaction.user_name}
                      </span>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {transaction.created_at_relative}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <span className="block">{getTypeLabel(transaction.transaction_type)}</span>
                      <span className="text-theme-xs">{transaction.reference}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {transaction.amount_formatted}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color={getStatusBadgeColor(transaction.status)}>
                        {getStatusLabel(transaction.status)}
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
