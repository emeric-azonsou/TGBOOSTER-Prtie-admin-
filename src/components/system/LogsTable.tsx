"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import type { AdminLogWithUser } from "@/types/system.types";
import LogsFilter from "./LogsFilter";
import LogsPagination from "./LogsPagination";
import { getAdminLogs } from "@/app/actions/system.actions";
import { useRouter } from "next/navigation";

interface LogsTableProps {
  initialLogs: AdminLogWithUser[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export default function LogsTable({
  initialLogs,
  initialPagination,
}: LogsTableProps) {
  const router = useRouter();
  const [logs, setLogs] = useState(initialLogs);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  const getActionColor = (
    action: string
  ): "success" | "error" | "warning" | "info" => {
    if (action.includes("login") || action.includes("created")) return "success";
    if (
      action.includes("rejected") ||
      action.includes("banned") ||
      action.includes("suspended")
    )
      return "error";
    if (action.includes("updated") || action.includes("approved"))
      return "warning";
    return "info";
  };

  const formatAction = (action: string): string => {
    const actionMap: Record<string, string> = {
      user_created: "Création utilisateur",
      user_updated: "Modification utilisateur",
      user_suspended: "Suspension utilisateur",
      user_banned: "Bannissement utilisateur",
      task_validated: "Validation tâche",
      task_rejected: "Rejet tâche",
      task_created: "Création tâche",
      task_updated: "Modification tâche",
      dispute_created: "Création litige",
      dispute_resolved: "Résolution litige",
      withdrawal_approved: "Approbation retrait",
      withdrawal_rejected: "Rejet retrait",
      payment_processed: "Traitement paiement",
      system_config_updated: "Mise à jour configuration",
      admin_login: "Connexion admin",
      admin_logout: "Déconnexion admin",
    };
    return actionMap[action] || action;
  };

  const formatRelativeTime = (date: string): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "Il y a moins d'une minute";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
  };

  const handleFilterChange = async (newFilters: Record<string, unknown>) => {
    setLoading(true);
    setFilters(newFilters);

    const response = await getAdminLogs(newFilters, {
      page: 1,
      limit: pagination.limit,
    });

    if (response.success && response.data) {
      setLogs(response.data.data);
      setPagination(response.data.pagination);
    }
    setLoading(false);
  };

  const handlePageChange = async (page: number) => {
    setLoading(true);

    const response = await getAdminLogs(filters, {
      page,
      limit: pagination.limit,
    });

    if (response.success && response.data) {
      setLogs(response.data.data);
      setPagination(response.data.pagination);
    }
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <LogsFilter onFilterChange={handleFilterChange} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-5">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            Journal d&apos;activité des administrateurs
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {pagination.total} log{pagination.total > 1 ? "s" : ""} au total
          </p>
        </div>

        <div className="border-t border-gray-100 p-4 dark:border-gray-800 sm:p-6">
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Chargement...
              </p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Aucun log disponible pour le moment
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Admin
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Action
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Entité
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Détails
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Date
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {log.admin_name}
                          </span>
                          <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                            {log.admin_email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge size="sm" color={getActionColor(log.action)}>
                          {formatAction(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {log.entity_type ? (
                          <div className="text-theme-xs">
                            <div className="font-medium">{log.entity_type}</div>
                            {log.entity_id && (
                              <div className="text-gray-400 dark:text-gray-500">
                                ID: {log.entity_id.substring(0, 8)}...
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <div className="max-w-xs truncate text-theme-xs">
                            {JSON.stringify(log.details)}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        <div>
                          <div className="text-theme-xs">
                            {formatRelativeTime(log.created_at)}
                          </div>
                          <div className="text-gray-400 text-theme-2xs dark:text-gray-500">
                            {new Date(log.created_at).toLocaleString("fr-FR")}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination.total_pages > 1 && (
                <LogsPagination
                  currentPage={pagination.page}
                  totalPages={pagination.total_pages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
