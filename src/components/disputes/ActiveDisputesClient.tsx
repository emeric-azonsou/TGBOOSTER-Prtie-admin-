"use client";

import React, { useState } from "react";
import Link from "next/link";
import type {
  PaginatedDisputes,
  DisputeFilters,
  DisputePriority,
} from "@/types/dispute.types";
import {
  getDisputes,
  escalateDispute,
  updateDisputePriority,
} from "./dispute-actions";
import ComponentCard from "@/components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ActiveDisputesClientProps {
  initialData: PaginatedDisputes;
}

export default function ActiveDisputesClient({
  initialData,
}: ActiveDisputesClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [disputesData, setDisputesData] = useState(initialData);
  const [filters, setFilters] = useState<DisputeFilters>({
    status: "pending",
    page: 1,
    limit: 20,
  });

  const handleFiltersChange = async (newFilters: DisputeFilters) => {
    setIsLoading(true);
    try {
      const result = await getDisputes({
        ...filters,
        ...newFilters,
        status: "pending",
      });
      if (result.success && result.data) {
        setDisputesData(result.data);
        setFilters({ ...filters, ...newFilters });
      }
    } catch (error) {
      console.error("Error fetching disputes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriorityChange = async (disputeId: string, priority: string) => {
    setIsLoading(true);
    try {
      await updateDisputePriority(disputeId, priority as DisputePriority);
      await handleFiltersChange({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscalate = async (disputeId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir escalader ce litige ?")) return;

    setIsLoading(true);
    try {
      const result = await escalateDispute(
        disputeId,
        "Litige escaladé par le modérateur"
      );
      if (result.success) {
        await handleFiltersChange({});
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <select
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            value={filters.priority || "all"}
            onChange={(e) =>
              handleFiltersChange({ priority: e.target.value as DisputeFilters["priority"] })
            }
            disabled={isLoading}
          >
            <option value="all">Toutes priorités</option>
            <option value="urgent">Urgent</option>
            <option value="high">Haute</option>
            <option value="normal">Normale</option>
            <option value="low">Basse</option>
          </select>
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
      </div>

      <ComponentCard title="Litiges nécessitant une intervention">
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
                      Motif
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Priorité
                    </TableCell>
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
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {disputesData.disputes.map((dispute) => (
                    <TableRow key={dispute.dispute_id}>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {dispute.client_name}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {dispute.client_email}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {dispute.executant_name}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {dispute.executant_email}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {dispute.campaign_title}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {dispute.reason}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        <select
                          value={dispute.priority}
                          onChange={(e) =>
                            handlePriorityChange(dispute.dispute_id, e.target.value)
                          }
                          disabled={isLoading}
                          className="px-2 py-1 text-xs border border-gray-300 rounded dark:border-gray-700 dark:bg-gray-800"
                        >
                          <option value="low">Basse</option>
                          <option value="normal">Normale</option>
                          <option value="high">Haute</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        <span className="block text-sm">
                          {dispute.submitted_at_relative}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <div className="flex gap-2">
                          <Link
                            href={`/disputes/${dispute.dispute_id}`}
                            className="px-3 py-1 text-xs font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 transition-colors"
                          >
                            Examiner
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleEscalate(dispute.dispute_id)}
                            disabled={isLoading}
                            className="px-3 py-1 text-xs font-medium text-error-600 bg-error-50 rounded hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 transition-colors disabled:opacity-50"
                          >
                            Escalader
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {disputesData.disputes.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucun litige en cours
                  </p>
                </div>
              )}

              {disputesData.totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/[0.05]">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Page {disputesData.page} sur {disputesData.totalPages} (
                    {disputesData.total} résultats)
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={disputesData.page === 1 || isLoading}
                      onClick={() =>
                        handleFiltersChange({ page: disputesData.page - 1 })
                      }
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <button
                      type="button"
                      disabled={
                        disputesData.page === disputesData.totalPages || isLoading
                      }
                      onClick={() =>
                        handleFiltersChange({ page: disputesData.page + 1 })
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
