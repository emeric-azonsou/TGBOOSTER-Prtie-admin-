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
import type { ClientCampaign } from "@/types/client.types";
import type { BadgeColor } from "@/components/ui/badge/Badge";

interface ClientCampaignsListProps {
  campaigns: ClientCampaign[];
}

export default function ClientCampaignsList({ campaigns }: ClientCampaignsListProps) {
  const getStatusColor = (status: ClientCampaign["status"]): BadgeColor => {
    const statusColors: Record<ClientCampaign["status"], BadgeColor> = {
      active: "success",
      completed: "info",
      paused: "warning",
      draft: "light",
      cancelled: "error",
    };
    return statusColors[status] || "light";
  };

  const getStatusLabel = (status: ClientCampaign["status"]): string => {
    const statusLabels: Record<ClientCampaign["status"], string> = {
      active: "Active",
      completed: "Terminée",
      paused: "En pause",
      draft: "Brouillon",
      cancelled: "Annulée",
    };
    return statusLabels[status] || status;
  };

  if (campaigns.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aucune campagne pour ce client
        </p>
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
              Titre
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
              Dépensé
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Progression
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Statut
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="px-5 py-4 text-start">
                <Link
                  href={`/campaigns/${campaign.id}`}
                  className="font-medium text-gray-800 text-theme-sm dark:text-white/90 hover:text-brand-500"
                >
                  {campaign.title}
                </Link>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                {campaign.type}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                {campaign.budget}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                {campaign.spent}
              </TableCell>
              <TableCell className="px-4 py-3 text-start">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3ch]">
                    {campaign.progress}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-start">
                <Badge size="sm" color={getStatusColor(campaign.status)}>
                  {getStatusLabel(campaign.status)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
