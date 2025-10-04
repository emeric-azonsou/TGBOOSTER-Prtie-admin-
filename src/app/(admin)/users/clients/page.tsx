import React, { Suspense } from "react";
import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import ClientsTable from "@/components/clients/ClientsTable";
import { ClientService } from "@/services/client.service";

export const metadata: Metadata = {
  title: "Clients | Admin - TikTok Visibility Platform",
  description: "Liste des clients de la plateforme",
};

export const revalidate = 30; // Revalider toutes les 30 secondes

async function ClientsList() {
  const { clients, total, page, totalPages } = await ClientService.getClients({
    limit: 20,
    sortBy: "joinedDate",
    sortOrder: "desc",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {total} client{total > 1 ? "s" : ""} au total
          </p>
        </div>
      </div>

      <ClientsTable clients={clients} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} sur {totalPages}
          </p>
        </div>
      )}
    </div>
  );
}

function ClientsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
      <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
    </div>
  );
}

export default function ClientsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Clients" />
      <ComponentCard title="Liste des Clients">
        <Suspense fallback={<ClientsLoading />}>
          <ClientsList />
        </Suspense>
      </ComponentCard>
    </div>
  );
}
