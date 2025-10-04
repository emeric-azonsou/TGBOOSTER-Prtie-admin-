"use client";

import React, { useState } from "react";
import type { PaginatedDisputes, DisputeFilters } from "@/types/dispute.types";
import { getDisputes } from "./dispute-actions";
import ComponentCard from "@/components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";

interface ResolvedDisputesClientProps {
  initialData: PaginatedDisputes;
}

export default function ResolvedDisputesClient({
  initialData,
}: ResolvedDisputesClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [disputesData, setDisputesData] = useState(initialData);
  const [filters, setFilters] = useState<DisputeFilters>({
    status: "resolved",
    page: 1,
    limit: 20,
  });

  const handleFiltersChange = async (newFilters: DisputeFilters) => {
    setIsLoading(true);
    try {
      const result = await getDisputes({
        ...filters,
        ...newFilters,
        status: "resolved",
      });
      if (result.success && result.data) {
        setDisputesData(result.data);
        setFilters({ ...filters, ...newFilters });
      }
    } catch (error) {
      console.error("Error fetching resolved disputes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getResolutionLabel = (resolution: string) => {
    const labels: Record<string, string> = {
      favor_client: "En faveur du client",
      favor_executant: "En faveur de l'exécutant",
      partial_refund: "Remboursement partiel",
      no_action: "Aucune action",
      escalated: "Escaladé",
    };
    return labels[resolution] || resolution;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Rechercher..."
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
          value={filters.search || ""}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          onKeyDown={(e) =>
            e.key === "Enter" && handleFiltersChange({ search: filters.search })
          }
          disabled={isLoading}
        />
      </div>

      <ComponentCard title="Historique des litiges résolus">
        <div className="w-full overflow-x-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400">Chargement...</div>
            </div>
          )}

          {!isLoading && (
            <>
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Client
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
                      Résolution
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Résolu par
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {disputesData.disputes.map((dispute) => (
                    <TableRow key={dispute.dispute_id}>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {dispute.resolved_at_relative}
                        </span>
                        <br />
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {dispute.resolved_at &&
                            new Date(dispute.resolved_at).toLocaleDateString("fr-FR")}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {dispute.client_name}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {dispute.executant_name}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {dispute.campaign_title}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge size="sm" color="success">
                          {getResolutionLabel(dispute.resolution || "")}
                        </Badge>
                        {dispute.refund_amount_formatted && (
                          <span className="block mt-1 text-xs text-gray-500">
                            Remboursement: {dispute.refund_amount_formatted}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {dispute.moderator_name || "Admin"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {disputesData.disputes.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucun litige résolu
                  </p>
                </div>
              )}

              {disputesData.totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/[0.05]">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Page {disputesData.page} sur {disputesData.totalPages} ({disputesData.total} résultats)
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={disputesData.page === 1 || isLoading}
                      onClick={() => handleFiltersChange({ page: disputesData.page - 1 })}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <button
                      type="button"
                      disabled={disputesData.page === disputesData.totalPages || isLoading}
                      onClick={() => handleFiltersChange({ page: disputesData.page + 1 })}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ComponentCard>
    </div>
  );
}
