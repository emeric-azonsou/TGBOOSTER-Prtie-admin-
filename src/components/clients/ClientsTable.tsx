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
import type { ClientListItem } from "@/types/client.types";
import type { BadgeColor } from "@/components/ui/badge/Badge";

interface ClientsTableProps {
  clients: ClientListItem[];
}

export default function ClientsTable({ clients }: ClientsTableProps) {
  const getStatusColor = (status: ClientListItem["status"]): BadgeColor => {
    const statusColors: Record<ClientListItem["status"], BadgeColor> = {
      active: "success",
      pending_verification: "warning",
      suspended: "error",
      banned: "error",
    };
    return statusColors[status] || "light";
  };

  const getStatusLabel = (status: ClientListItem["status"]): string => {
    const statusLabels: Record<ClientListItem["status"], string> = {
      active: "Actif",
      pending_verification: "En attente",
      suspended: "Suspendu",
      banned: "Banni",
    };
    return statusLabels[status] || status;
  };

  if (clients.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucun client trouvé
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
              Client
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Entreprise
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
              Campagnes
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Total dépensé
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
              Dernière connexion
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="px-5 py-4 text-start">
                <Link
                  href={`/users/clients/${client.id}`}
                  className="block"
                >
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 hover:text-brand-500">
                        {client.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {client.email}
                      </p>
                    </div>
                    {client.isVerified && (
                      <Badge size="sm" color="success">
                        Vérifié
                      </Badge>
                    )}
                  </div>
                </Link>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                {client.company || "-"}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                {client.businessType || "-"}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                {client.totalCampaigns}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                {client.totalSpent}
              </TableCell>
              <TableCell className="px-4 py-3 text-start">
                <Badge size="sm" color={getStatusColor(client.status)}>
                  {getStatusLabel(client.status)}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                {client.lastLogin || "Jamais"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
