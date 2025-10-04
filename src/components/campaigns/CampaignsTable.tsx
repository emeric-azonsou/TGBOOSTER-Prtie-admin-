/**
 * CampaignsTable - Professional table component for displaying campaigns
 */

"use client";

import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import type { BadgeColor } from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CampaignListItem, TaskStatus } from "@/types/campaign.types";

interface CampaignsTableProps {
  campaigns: CampaignListItem[];
  onPause?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export default function CampaignsTable({
  campaigns,
  onPause,
  onCancel,
}: CampaignsTableProps) {
  const getStatusColor = (status: TaskStatus): BadgeColor => {
    switch (status) {
      case "active":
        return "success";
      case "draft":
        return "light";
      case "paused":
        return "warning";
      case "completed":
        return "info";
      case "cancelled":
        return "error";
      default:
        return "light";
    }
  };

  const getPriorityColor = (priority: string): BadgeColor => {
    switch (priority) {
      case "urgent":
        return "error";
      case "high":
        return "warning";
      case "normal":
        return "info";
      case "low":
        return "light";
      default:
        return "light";
    }
  };

  if (campaigns.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Aucune campagne trouvée
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
                Campagne
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
                Type
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Budget
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Progrès
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
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="px-5 py-4 text-start">
                  <div>
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="font-medium text-gray-800 text-theme-sm dark:text-white/90 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      {campaign.title}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Créée le {campaign.createdDate}
                    </p>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3 text-start">
                  <Link
                    href={`/users/clients/${campaign.clientId}`}
                    className="text-gray-700 text-theme-sm dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    {campaign.clientName}
                  </Link>
                </TableCell>

                <TableCell className="px-4 py-3 text-start">
                  <Badge size="sm" color="info">
                    {campaign.type}
                  </Badge>
                </TableCell>

                <TableCell className="px-4 py-3 text-start">
                  <div className="text-theme-sm">
                    <p className="font-medium text-gray-800 dark:text-white/90">
                      {campaign.budget}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Dépensé: {campaign.spent}
                    </p>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3 text-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full dark:bg-gray-700">
                        <div
                          className="h-1.5 bg-brand-500 rounded-full transition-all"
                          style={{ width: `${campaign.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[3rem] text-right">
                        {campaign.progress}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {campaign.quantityCompleted} / {campaign.quantityRequired}
                    </p>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3 text-start">
                  <div className="flex flex-col gap-1">
                    <Badge size="sm" color={getStatusColor(campaign.status)}>
                      {campaign.statusLabel}
                    </Badge>
                    {campaign.priority !== "normal" && (
                      <Badge size="sm" color={getPriorityColor(campaign.priority)}>
                        {campaign.priorityLabel}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3 text-start">
                  <div className="flex gap-2">
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="px-3 py-1 text-xs font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20 transition-colors"
                    >
                      Détails
                    </Link>
                    {campaign.status === "active" && onPause && (
                      <button
                        type="button"
                        onClick={() => onPause(campaign.id)}
                        className="px-3 py-1 text-xs font-medium text-warning-600 bg-warning-50 rounded hover:bg-warning-100 dark:bg-warning-500/10 dark:text-warning-400 dark:hover:bg-warning-500/20 transition-colors"
                      >
                        Pause
                      </button>
                    )}
                    {(campaign.status === "active" || campaign.status === "paused") && onCancel && (
                      <button
                        type="button"
                        onClick={() => onCancel(campaign.id)}
                        className="px-3 py-1 text-xs font-medium text-error-600 bg-error-50 rounded hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 dark:hover:bg-error-500/20 transition-colors"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
