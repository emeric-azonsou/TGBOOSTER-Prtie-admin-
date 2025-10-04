/**
 * CampaignExecutionsTable - Table displaying campaign executions
 */

"use client";

import Badge from "@/components/ui/badge/Badge";
import type { BadgeColor } from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CampaignExecution, ExecutionStatus } from "@/types/campaign.types";
import { formatRelativeTime } from "@/lib/utils/formatters";

interface CampaignExecutionsTableProps {
  executions: CampaignExecution[];
}

export default function CampaignExecutionsTable({
  executions,
}: CampaignExecutionsTableProps) {
  const getStatusColor = (status: ExecutionStatus): BadgeColor => {
    switch (status) {
      case "completed":
        return "success";
      case "rejected":
        return "error";
      case "submitted":
        return "warning";
      case "in_progress":
        return "info";
      case "assigned":
        return "light";
      default:
        return "light";
    }
  };

  const getStatusLabel = (status: ExecutionStatus): string => {
    switch (status) {
      case "assigned":
        return "Assignée";
      case "in_progress":
        return "En cours";
      case "submitted":
        return "Soumise";
      case "completed":
        return "Validée";
      case "rejected":
        return "Rejetée";
      default:
        return status;
    }
  };

  if (executions.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Aucune exécution pour le moment
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="w-full overflow-x-auto">
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
                Statut
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
                Date
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Note
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {executions.map((execution) => {
              const totalAmount = execution.reward_cents + execution.bonus_cents;
              const formattedAmount = Math.floor(totalAmount / 100).toLocaleString("fr-FR");

              return (
                <TableRow key={execution.execution_id}>
                  <TableCell className="px-5 py-4 text-start">
                    <div>
                      <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {execution.executant_name}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {execution.executant_email}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start">
                    <Badge
                      size="sm"
                      color={getStatusColor(execution.status)}
                    >
                      {getStatusLabel(execution.status)}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start">
                    <div className="text-theme-sm">
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {formattedAmount} FCFA
                      </p>
                      {execution.bonus_cents > 0 && (
                        <p className="text-xs text-success-600 dark:text-success-400">
                          +{Math.floor(execution.bonus_cents / 100)} bonus
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {execution.completed_at
                      ? formatRelativeTime(execution.completed_at)
                      : execution.submitted_at
                        ? formatRelativeTime(execution.submitted_at)
                        : formatRelativeTime(execution.created_at)}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start">
                    {execution.rating ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {execution.rating}
                        </span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        -
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
