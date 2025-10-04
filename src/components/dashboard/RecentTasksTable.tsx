import React from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RecentTask } from "@/types/dashboard.types";

interface RecentTasksTableProps {
  tasks: RecentTask[];
}

export default function RecentTasksTable({ tasks }: RecentTasksTableProps) {
  const getStatusColor = (status: RecentTask["status"]) => {
    switch (status) {
      case "Validé":
        return "success";
      case "En attente":
        return "warning";
      case "Rejeté":
        return "error";
      default:
        return "light";
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
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
                Campagne
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
                Date
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="px-5 py-8 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aucune tâche récente
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="px-5 py-4 text-start">
                    <Link
                      href={`/users/executants/${task.executantId}`}
                      className="font-medium text-gray-800 text-theme-sm dark:text-white/90 hover:text-brand-500"
                    >
                      {task.executant}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Link
                      href={`/campaigns/${task.campaignId}`}
                      className="hover:text-brand-500"
                    >
                      {task.campaign}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <Badge size="sm" color={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {task.date}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
