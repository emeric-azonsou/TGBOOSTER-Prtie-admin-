import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import { DisputeService } from "@/services/dispute.service";
import ActiveDisputesClient from "@/components/disputes/ActiveDisputesClient";

export const metadata: Metadata = {
  title: "Litiges En Cours | Admin - TikTok Visibility Platform",
  description: "Gestion des litiges en cours",
};

export const revalidate = 30; // Revalider toutes les 30 secondes

export default async function ActiveDisputesPage() {
  const disputesData = await DisputeService.getDisputes({
    status: "pending",
    page: 1,
    limit: 20,
    sortBy: "submittedDate",
    sortOrder: "desc",
  });

  return (
    <div>
      <PageBreadcrumb pageTitle="Litiges En Cours" />
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ComponentCard title="En attente">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {disputesData.stats.totalPending}
            </div>
          </ComponentCard>

          <ComponentCard title="En investigation">
            <div className="text-3xl font-bold text-warning-600 dark:text-warning-400">
              {disputesData.stats.totalInvestigating}
            </div>
          </ComponentCard>

          <ComponentCard title="Résolus">
            <div className="text-3xl font-bold text-success-600 dark:text-success-400">
              {disputesData.stats.totalResolved}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {disputesData.stats.resolutionRate.toFixed(1)}% taux de résolution
            </p>
          </ComponentCard>

          <ComponentCard title="Temps moyen de résolution">
            <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">
              {disputesData.stats.averageResolutionTime
                ? `${disputesData.stats.averageResolutionTime.toFixed(1)}h`
                : "N/A"}
            </div>
          </ComponentCard>
        </div>

        <ActiveDisputesClient initialData={disputesData} />
      </div>
    </div>
  );
}
