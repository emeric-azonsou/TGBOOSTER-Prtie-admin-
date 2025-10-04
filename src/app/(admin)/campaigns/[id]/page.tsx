/**
 * Campaign Details Page - Professional implementation with real data
 */

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CampaignHeader from "@/components/campaigns/details/CampaignHeader";
import CampaignStats from "@/components/campaigns/details/CampaignStats";
import CampaignExecutionsTable from "@/components/campaigns/details/CampaignExecutionsTable";
import { CampaignService } from "@/services/campaign.service";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const campaign = await CampaignService.getCampaignById(id);

  if (!campaign) {
    return {
      title: "Campagne non trouvée | Admin",
    };
  }

  return {
    title: `${campaign.title} | Détails Campagne`,
    description: `Détails de la campagne ${campaign.title}`,
  };
}

export default async function CampaignDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const campaign = await CampaignService.getCampaignById(id);

  if (!campaign) {
    notFound();
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={campaign.title} />

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CampaignHeader campaign={campaign} />
          </div>

          <div>
            <CampaignStats campaign={campaign} stats={campaign.stats} />
          </div>
        </div>

        <ComponentCard title={`Exécutions Récentes (${campaign.executions.length})`}>
          <CampaignExecutionsTable executions={campaign.executions} />
        </ComponentCard>
      </div>
    </div>
  );
}
