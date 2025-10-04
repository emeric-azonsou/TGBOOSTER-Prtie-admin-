/**
 * ExecutantsTable - Table component for displaying executants list
 */

import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import type { ExecutantListItem } from "@/types/executant.types";
import type { BadgeColor } from "@/components/ui/badge/Badge";

interface ExecutantsTableProps {
  executants: ExecutantListItem[];
}

export default function ExecutantsTable({ executants }: ExecutantsTableProps) {
  const getStatusColor = (
    status: ExecutantListItem["status"]
  ): BadgeColor => {
    switch (status) {
      case "active":
        return "success";
      case "pending_verification":
        return "warning";
      case "suspended":
        return "warning";
      case "banned":
        return "error";
      default:
        return "light";
    }
  };

  const getStatusLabel = (status: ExecutantListItem["status"]): string => {
    switch (status) {
      case "active":
        return "Actif";
      case "pending_verification":
        return "En attente";
      case "suspended":
        return "Suspendu";
      case "banned":
        return "Banni";
      default:
        return status;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={
            i <= rating ? "text-warning-500" : "text-gray-300 dark:text-gray-600"
          }
        >
          ★
        </span>
      );
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  if (executants.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucun exécutant trouvé
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
              Exécutant
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              TikTok
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Performance
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Abonnement
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
              Actions
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {executants.map((executant) => (
            <TableRow key={executant.id}>
              <TableCell className="px-5 py-4 text-start">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {executant.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {executant.email}
                    </p>
                    {executant.isVerified && (
                      <div className="mt-1">
                        <Badge size="sm" color="success">
                          Vérifié
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                {executant.tiktokHandle ? `@${executant.tiktokHandle}` : "Non renseigné"}
              </TableCell>
              <TableCell className="px-4 py-3 text-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {executant.totalTasks} tâches
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs font-medium text-success-600 dark:text-success-500">
                      {executant.totalEarned}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(Math.round(executant.rating))}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({executant.rating.toFixed(1)}) • {executant.successRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-start">
                {executant.subscriptionTier ? (
                  <Badge size="sm" color="primary">
                    {executant.subscriptionTier.replace("_", " ").toUpperCase()}
                  </Badge>
                ) : (
                  <span className="text-gray-400 text-theme-sm">Aucun</span>
                )}
              </TableCell>
              <TableCell className="px-4 py-3 text-start">
                <Badge size="sm" color={getStatusColor(executant.status)}>
                  {getStatusLabel(executant.status)}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-3 text-start">
                <Link
                  href={`/users/executants/${executant.id}`}
                  className="text-theme-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
                >
                  Voir détails
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
