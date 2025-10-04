"use client";

import React, { useState } from "react";
import type {
  PaginatedValidationHistory,
  ValidationHistoryFilters,
} from "@/types/validation-history.types";
import ValidationHistoryFiltersComponent from "./ValidationHistoryFilters";
import { getValidationHistory, exportValidationHistory } from "./history-actions";
import ComponentCard from "@/components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";

interface ValidationHistoryClientProps {
  initialData: PaginatedValidationHistory;
}

export default function ValidationHistoryClient({
  initialData,
}: ValidationHistoryClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [historyData, setHistoryData] = useState(initialData);

  const handleFiltersChange = async (filters: ValidationHistoryFilters) => {
    setIsLoading(true);
    try {
      const result = await getValidationHistory(filters);
      if (result.success && result.data) {
        setHistoryData(result.data);
      }
    } catch (error) {
      console.error("Error fetching validation history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const result = await exportValidationHistory();
      if (result.success && result.data) {
        const blob = new Blob([result.data.csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", result.data.filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error exporting validation history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <ValidationHistoryFiltersComponent
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white rounded-md bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 whitespace-nowrap"
        >
          {isLoading ? "Export en cours..." : "Exporter CSV"}
        </button>
      </div>

      <ComponentCard title="Historique complet des validations">
        <div className="w-full overflow-x-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                Chargement...
              </div>
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
                      Validé par
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Décision
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Montant
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {historyData.records.map((record) => (
                    <TableRow key={record.execution_id}>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {record.reviewed_at_relative}
                        </span>
                        <br />
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(record.reviewed_at).toLocaleDateString(
                            "fr-FR"
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {record.executant_name}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {record.executant_email}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {record.campaign_title}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge size="sm" color="info">
                          {record.task_type_label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {record.reviewer_name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={
                            record.decision === "approved" ? "success" : "error"
                          }
                        >
                          {record.decision === "approved"
                            ? "Approuvé"
                            : "Rejeté"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <span className="font-medium text-gray-800 dark:text-white">
                          {record.reward_formatted}
                        </span>
                        {record.bonus_formatted && (
                          <span className="block text-xs text-green-600 dark:text-green-400">
                            + {record.bonus_formatted} bonus
                          </span>
                        )}
                        {record.rating && (
                          <span className="block text-xs text-gray-400">
                            ⭐ {record.rating}/5
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {historyData.records.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucun historique de validation disponible
                  </p>
                </div>
              )}

              {historyData.totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/[0.05]">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Page {historyData.page} sur {historyData.totalPages} ({historyData.total} résultats)
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={historyData.page === 1 || isLoading}
                      onClick={() =>
                        handleFiltersChange({ page: historyData.page - 1 })
                      }
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <button
                      type="button"
                      disabled={
                        historyData.page === historyData.totalPages || isLoading
                      }
                      onClick={() =>
                        handleFiltersChange({ page: historyData.page + 1 })
                      }
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
