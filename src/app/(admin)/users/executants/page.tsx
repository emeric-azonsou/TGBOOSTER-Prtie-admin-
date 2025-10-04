import React, { Suspense } from "react";
import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import ExecutantsTable from "@/components/executants/ExecutantsTable";
import { ExecutantService } from "@/services/executant.service";

export const metadata: Metadata = {
  title: "Exécutants | Admin - TikTok Visibility Platform",
  description: "Liste des exécutants de la plateforme",
};

export const revalidate = 30; // Revalider toutes les 30 secondes

async function ExecutantsList() {
  const { executants, total, page, totalPages } =
    await ExecutantService.getExecutants({
      limit: 20,
      sortBy: "joinedDate",
      sortOrder: "desc",
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {total} exécutant{total > 1 ? "s" : ""} au total
          </p>
        </div>
      </div>

      <ExecutantsTable executants={executants} />

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

function ExecutantsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
      <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
    </div>
  );
}

export default function ExecutantsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Exécutants" />
      <ComponentCard title="Liste des Exécutants">
        <Suspense fallback={<ExecutantsLoading />}>
          <ExecutantsList />
        </Suspense>
      </ComponentCard>
    </div>
  );
}
