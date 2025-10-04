import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import { SanctionService } from "@/services/sanction.service";
import SanctionsClient from "@/components/disputes/SanctionsClient";

export const metadata: Metadata = {
  title: "Sanctions | Admin - TikTok Visibility Platform",
  description: "Gestion des sanctions utilisateurs",
};

export const revalidate = 30; // Revalider toutes les 30 secondes

export default async function SanctionsPage() {
  const sanctionsData = await SanctionService.getSanctions({
    status: "active",
    page: 1,
    limit: 20,
    sortBy: "appliedDate",
    sortOrder: "desc",
  });

  return (
    <div>
      <PageBreadcrumb pageTitle="Sanctions Utilisateurs" />
      <SanctionsClient initialData={sanctionsData} />
    </div>
  );
}
