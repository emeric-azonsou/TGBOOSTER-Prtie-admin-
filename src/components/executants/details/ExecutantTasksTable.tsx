/**
 * ExecutantTasksTable - Displays executant task history
 */

import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExecutantTask } from "@/types/executant.types";
import type { BadgeColor } from "@/components/ui/badge/Badge";

interface ExecutantTasksTableProps {
  tasks: ExecutantTask[];
}

export default function ExecutantTasksTable({ tasks }: ExecutantTasksTableProps) {
  const getStatusColor = (status: ExecutantTask["status"]): BadgeColor => {
    switch (status) {
      case "completed":
        return "success";
      case "submitted":
        return "info";
      case "in_progress":
        return "warning";
      case "rejected":
        return "error";
      case "assigned":
        return "light";
      default:
        return "light";
    }
  };

  const getStatusLabel = (status: ExecutantTask["status"]): string => {
    switch (status) {
      case "completed":
        return "Validé";
      case "submitted":
        return "Soumis";
      case "in_progress":
        return "En cours";
      case "rejected":
        return "Rejeté";
      case "assigned":
        return "Assigné";
      default:
        return status;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucune tâche trouvée
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <Table>
        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
          <TableRow>
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
              Montant
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
              Date Soumission
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="px-5 py-4 text-start">
                <Link
                  href={`/campaigns/${task.campaignId}`}
                  className="font-medium text-gray-800 text-theme-sm dark:text-white/90 hover:text-brand-500"
                >
                  {task.campaignTitle}
                </Link>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                {task.taskType}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                {task.amount}
              </TableCell>
              <TableCell className="px-4 py-3 text-start">
                <div className="space-y-1">
                  <Badge size="sm" color={getStatusColor(task.status)}>
                    {getStatusLabel(task.status)}
                  </Badge>
                  {task.status === "rejected" && task.rejectionReason && (
                    <p className="text-xs text-error-600 dark:text-error-400">
                      {task.rejectionReason}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                {task.submittedAt || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
