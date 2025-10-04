/**
 * AllCampaignsClient - Client component for campaigns list with filters
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CampaignsTable from "@/components/campaigns/CampaignsTable";
import CampaignFilters from "@/components/campaigns/CampaignFilters";
import Pagination from "@/components/campaigns/Pagination";
import { pauseCampaign, cancelCampaign } from "@/components/campaigns/actions";
import type { CampaignListItem, TaskType, TaskStatus, TaskPriority } from "@/types/campaign.types";

interface AllCampaignsClientProps {
  initialCampaigns: CampaignListItem[];
  initialPage: number;
  initialTotal: number;
  initialTotalPages: number;
}

export default function AllCampaignsClient({
  initialCampaigns,
  initialPage,
  initialTotal,
  initialTotalPages,
}: AllCampaignsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (filters: {
    search?: string;
    status?: TaskStatus | "all";
    type?: TaskType | "all";
    priority?: TaskPriority | "all";
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (filters.search) {
      params.set("search", filters.search);
    } else {
      params.delete("search");
    }

    if (filters.status && filters.status !== "all") {
      params.set("status", filters.status);
    } else {
      params.delete("status");
    }

    if (filters.type && filters.type !== "all") {
      params.set("type", filters.type);
    } else {
      params.delete("type");
    }

    if (filters.priority && filters.priority !== "all") {
      params.set("priority", filters.priority);
    } else {
      params.delete("priority");
    }

    params.delete("page");

    startTransition(() => {
      router.push(`/campaigns/all?${params.toString()}`);
    });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());

    startTransition(() => {
      router.push(`/campaigns/all?${params.toString()}`);
    });
  };

  const handlePause = async (campaignId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir mettre en pause cette campagne ?")) {
      return;
    }

    const result = await pauseCampaign(campaignId);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Erreur lors de la mise en pause");
    }
  };

  const handleCancel = async (campaignId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette campagne ? Cette action est irréversible.")) {
      return;
    }

    const result = await cancelCampaign(campaignId);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Erreur lors de l'annulation");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CampaignFilters onFilterChange={handleFilterChange} />
      </div>

      {isPending && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
        </div>
      )}

      {!isPending && (
        <>
          <CampaignsTable
            campaigns={initialCampaigns}
            onPause={handlePause}
            onCancel={handleCancel}
          />

          <Pagination
            currentPage={initialPage}
            totalPages={initialTotalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
