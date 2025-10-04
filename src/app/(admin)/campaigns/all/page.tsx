/**
 * All Campaigns Page - Professional implementation with real data
 */

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AllCampaignsClient from "./AllCampaignsClient";
import { CampaignService } from "@/services/campaign.service";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Toutes les Campagnes | Admin - TikTok Visibility Platform",
  description: "Gestion de toutes les campagnes de la plateforme",
};

export const revalidate = 30; // Revalider toutes les 30 secondes

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    type?: string;
    priority?: string;
  }>;
}

export default async function AllCampaignsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const status = params.status || "all";
  const type = params.type || "all";
  const priority = params.priority || "all";

  const { campaigns, total, totalPages } = await CampaignService.getCampaigns({
    page,
    limit: 20,
    search,
    status: status as any,
    type: type as any,
    priority: priority as any,
    sortBy: "createdDate",
    sortOrder: "desc",
  });

  return (
    <div>
      <PageBreadcrumb pageTitle="Toutes les Campagnes" />
      <div className="space-y-6">
        <ComponentCard title="Liste de toutes les Campagnes">
          <AllCampaignsClient
            initialCampaigns={campaigns}
            initialPage={page}
            initialTotal={total}
            initialTotalPages={totalPages}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
