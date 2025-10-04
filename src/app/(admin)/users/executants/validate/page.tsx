import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Validation Identité | Admin - TikTok Visibility Platform",
  description: "Validation d'identité des exécutants",
};

export default function ValidateExecutantsPage() {
  const pendingValidations = [
    {
      id: "1",
      name: "Moussa Traoré",
      email: "moussa.t@example.com",
      tiktokHandle: "@moussatr",
      tasksCompleted: 12,
      documentsSubmitted: true,
      submittedDate: "Il y a 2h",
    },
    {
      id: "2",
      name: "Karim Ouédraogo",
      email: "karim.o@example.com",
      tiktokHandle: "@karimo",
      tasksCompleted: 5,
      documentsSubmitted: true,
      submittedDate: "Il y a 1 jour",
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Validation d'Identité" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              Demandes en attente
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pendingValidations.length} exécutant(s) en attente de validation
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-medium text-white bg-success-500 rounded-lg hover:bg-success-600 transition-colors">
              Valider Sélectionnés
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-error-500 rounded-lg hover:bg-error-600 transition-colors">
              Rejeter Sélectionnés
            </button>
          </div>
        </div>

        <ComponentCard title="Exécutants en attente de validation">
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
                    Tâches
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Documents
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Soumis
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
                {pendingValidations.map((validation) => (
                  <TableRow key={validation.id}>
                    <TableCell className="px-5 py-4 text-start">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {validation.name}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {validation.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {validation.tiktokHandle}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {validation.tasksCompleted}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Badge
                        size="sm"
                        color={
                          validation.documentsSubmitted
                            ? "success"
                            : "warning"
                        }
                      >
                        {validation.documentsSubmitted
                          ? "Complets"
                          : "Incomplets"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {validation.submittedDate}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 transition-colors">
                          Vérifier
                        </button>
                        <button className="px-3 py-1 text-xs font-medium text-success-600 bg-success-50 rounded hover:bg-success-100 dark:bg-success-500/10 dark:text-success-400 transition-colors">
                          Approuver
                        </button>
                        <button className="px-3 py-1 text-xs font-medium text-error-600 bg-error-50 rounded hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 transition-colors">
                          Rejeter
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
