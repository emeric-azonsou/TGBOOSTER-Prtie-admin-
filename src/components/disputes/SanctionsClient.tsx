"use client";

import React, { useState } from "react";
import type { PaginatedSanctions, SanctionFilters } from "@/types/dispute.types";
import { getSanctions, revokeSanction } from "./dispute-actions";
import ComponentCard from "@/components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";

interface SanctionsClientProps {
  initialData: PaginatedSanctions;
}

export default function SanctionsClient({
  initialData,
}: SanctionsClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sanctionsData, setSanctionsData] = useState(initialData);
  const [filters, setFilters] = useState<SanctionFilters>({
    status: "active",
    page: 1,
    limit: 20,
  });

  const handleFiltersChange = async (newFilters: SanctionFilters) => {
    setIsLoading(true);
    try {
      const result = await getSanctions({ ...filters, ...newFilters });
      if (result.success && result.data) {
        setSanctionsData(result.data);
        setFilters({ ...filters, ...newFilters });
      }
    } catch (error) {
      console.error("Error fetching sanctions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (sanctionId: string) => {
    const reason = prompt("Raison de la révocation:");
    if (!reason) return;

    setIsLoading(true);
    try {
      const result = await revokeSanction(sanctionId, reason);
      if (result.success) {
        await handleFiltersChange({});
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getSanctionColor = (sanctionType: string) => {
    switch (sanctionType) {
      case "permanent_ban":
        return "error";
      case "temporary_suspension":
        return "warning";
      case "warning":
        return "info";
      default:
        return "light";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
        <ComponentCard title="Sanctions actives">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {sanctionsData.stats.totalActive}
          </div>
        </ComponentCard>
        <ComponentCard title="Suspensions">
          <div className="text-3xl font-bold text-warning-600 dark:text-warning-400">
            {sanctionsData.stats.suspensionsCount}
          </div>
        </ComponentCard>
        <ComponentCard title="Bannissements">
          <div className="text-3xl font-bold text-error-600 dark:text-error-400">
            {sanctionsData.stats.bansCount}
          </div>
        </ComponentCard>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <select
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            value={filters.status || "active"}
            onChange={(e) => handleFiltersChange({ status: e.target.value as any })}
            disabled={isLoading}
          >
            <option value="active">Actives</option>
            <option value="expired">Expirées</option>
            <option value="revoked">Révoquées</option>
          </select>
          <select
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            value={filters.sanctionType || "all"}
            onChange={(e) =>
              handleFiltersChange({ sanctionType: e.target.value as any })
            }
            disabled={isLoading}
          >
            <option value="all">Tous les types</option>
            <option value="warning">Avertissements</option>
            <option value="temporary_suspension">Suspensions</option>
            <option value="permanent_ban">Bannissements</option>
          </select>
        </div>
      </div>

      <ComponentCard title="Liste des sanctions">
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
                      Sanction
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Motif
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Expire
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
                  {sanctionsData.sanctions.map((sanction) => (
                    <TableRow key={sanction.sanction_id}>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {sanction.user_name}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {sanction.user_email}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge size="sm" color="info">
                          {sanction.user_type === "client" ? "Client" : "Exécutant"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge size="sm" color={getSanctionColor(sanction.sanction_type)}>
                          {sanction.sanction_type_label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {sanction.reason}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {sanction.expires_at_relative || "Permanent"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        {sanction.status === "active" && (
                          <button
                            type="button"
                            onClick={() => handleRevoke(sanction.sanction_id)}
                            disabled={isLoading}
                            className="px-3 py-1 text-xs font-medium text-success-600 bg-success-50 rounded hover:bg-success-100 dark:bg-success-500/10 dark:text-success-400 transition-colors disabled:opacity-50"
                          >
                            Révoquer
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {sanctionsData.sanctions.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucune sanction trouvée
                  </p>
                </div>
              )}

              {sanctionsData.totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/[0.05]">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Page {sanctionsData.page} sur {sanctionsData.totalPages} ({sanctionsData.total} résultats)
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={sanctionsData.page === 1 || isLoading}
                      onClick={() => handleFiltersChange({ page: sanctionsData.page - 1 })}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <button
                      type="button"
                      disabled={sanctionsData.page === sanctionsData.totalPages || isLoading}
                      onClick={() => handleFiltersChange({ page: sanctionsData.page + 1 })}
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
