import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import { ValidationHistoryService } from "@/services/validation-history.service";
import ValidationHistoryClient from "@/components/validation/ValidationHistoryClient";

export const metadata: Metadata = {
  title: "Historique Validations | Admin - TikTok Visibility Platform",
  description: "Historique des validations",
};

export const revalidate = 30; // Revalider toutes les 30 secondes

export default async function ValidationHistoryPage() {
  const historyData = await ValidationHistoryService.getValidationHistory({
    page: 1,
    limit: 20,
    sortBy: "reviewedDate",
    sortOrder: "desc",
  });

  return (
    <div>
      <PageBreadcrumb pageTitle="Historique des Validations" />
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ComponentCard title="Total validations">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {historyData.summary.totalValidations}
            </div>
          </ComponentCard>

          <ComponentCard title="Approuvées">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {historyData.summary.totalApproved}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {historyData.summary.approvalRate.toFixed(1)}% de taux d'approbation
            </p>
          </ComponentCard>

          <ComponentCard title="Rejetées">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {historyData.summary.totalRejected}
            </div>
          </ComponentCard>

          <ComponentCard title="Montant total payé">
            <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">
              {(historyData.summary.totalRewardPaid / 100).toLocaleString("fr-FR")} FCFA
            </div>
            {historyData.summary.totalBonusPaid > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                + {(historyData.summary.totalBonusPaid / 100).toLocaleString("fr-FR")} FCFA bonus
              </p>
            )}
          </ComponentCard>
        </div>

        <ValidationHistoryClient initialData={historyData} />
      </div>
    </div>
  );
}
