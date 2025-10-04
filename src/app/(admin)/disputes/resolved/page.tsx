import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import { DisputeService } from "@/services/dispute.service";
import ResolvedDisputesClient from "@/components/disputes/ResolvedDisputesClient";

export const metadata: Metadata = {
  title: "Litiges Résolus | Admin - TikTok Visibility Platform",
  description: "Historique des litiges résolus",
};

export const revalidate = 30; // Revalider toutes les 30 secondes

export default async function ResolvedDisputesPage() {
  const disputesData = await DisputeService.getDisputes({
    status: "resolved",
    page: 1,
    limit: 20,
    sortBy: "submittedDate",
    sortOrder: "desc",
  });

  return (
    <div>
      <PageBreadcrumb pageTitle="Litiges Résolus" />
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <ComponentCard title="Total résolus">
            <div className="text-3xl font-bold text-success-600 dark:text-success-400">
              {disputesData.stats.totalResolved}
            </div>
          </ComponentCard>

          <ComponentCard title="Taux de résolution">
            <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">
              {disputesData.stats.resolutionRate.toFixed(1)}%
            </div>
          </ComponentCard>

          <ComponentCard title="Temps moyen">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {disputesData.stats.averageResolutionTime
                ? `${disputesData.stats.averageResolutionTime.toFixed(1)}h`
                : "N/A"}
            </div>
          </ComponentCard>
        </div>

        <ResolvedDisputesClient initialData={disputesData} />
      </div>
    </div>
  );
}
