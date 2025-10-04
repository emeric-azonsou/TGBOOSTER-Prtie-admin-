/**
 * ExecutantTasksList - Display recent tasks for an executant
 */

import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import type { ExecutantTask } from "@/types/executant.types";
import type { BadgeColor } from "@/components/ui/badge/Badge";

interface ExecutantTasksListProps {
  tasks: ExecutantTask[];
}

export default function ExecutantTasksList({
  tasks,
}: ExecutantTasksListProps) {
  const getStatusColor = (status: ExecutantTask["status"]): BadgeColor => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "info";
      case "submitted":
        return "warning";
      case "assigned":
        return "light";
      case "rejected":
        return "error";
      default:
        return "light";
    }
  };

  const getStatusLabel = (status: ExecutantTask["status"]): string => {
    switch (status) {
      case "assigned":
        return "Assignée";
      case "in_progress":
        return "En cours";
      case "submitted":
        return "Soumise";
      case "completed":
        return "Complétée";
      case "rejected":
        return "Rejetée";
      default:
        return status;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aucune tâche récente
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell isHeader>Campagne</TableCell>
            <TableCell isHeader>Type</TableCell>
            <TableCell isHeader>Montant</TableCell>
            <TableCell isHeader>Statut</TableCell>
            <TableCell isHeader>Soumise le</TableCell>
            <TableCell isHeader>Complétée le</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {task.campaignTitle}
                </p>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {task.taskType}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-medium text-success-600 dark:text-success-500">
                  {task.amount}
                </span>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Badge size="sm" color={getStatusColor(task.status)}>
                    {getStatusLabel(task.status)}
                  </Badge>
                  {task.rejectionReason && (
                    <p className="text-xs text-error-600 dark:text-error-500">
                      {task.rejectionReason}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {task.submittedAt ? (
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {task.submittedAt}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                {task.completedAt ? (
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {task.completedAt}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
