import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";

export const metadata: Metadata = {
  title: "Admins | Admin - TikTok Visibility Platform",
  description: "Gestion des administrateurs de la plateforme",
};

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: string;
}

const adminsData: Admin[] = [
  {
    id: "1",
    name: "Emeric Admin",
    email: "emeric@tiktokvisibility.com",
    role: "Admin global",
    lastLogin: "Il y a 2h",
    status: "Active",
  },
  {
    id: "2",
    name: "Sophie Moderator",
    email: "sophie@tiktokvisibility.com",
    role: "Modérateur",
    lastLogin: "Il y a 1 jour",
    status: "Active",
  },
  {
    id: "3",
    name: "Paul Support",
    email: "paul@tiktokvisibility.com",
    role: "Support",
    lastLogin: "Il y a 3 jours",
    status: "Inactive",
  },
];

export default function AdminsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Gestion des Administrateurs" />
      <div className="space-y-6">
        <ComponentCard title="Liste des Administrateurs">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="w-full">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Administrateur
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Rôle
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Connexion
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
                  {adminsData.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="px-5 py-4 text-start">
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {admin.name}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {admin.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {admin.role}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {admin.lastLogin}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <Badge
                          size="sm"
                          color={
                            admin.status === "Active"
                              ? "success"
                              : "error"
                          }
                        >
                          {admin.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
