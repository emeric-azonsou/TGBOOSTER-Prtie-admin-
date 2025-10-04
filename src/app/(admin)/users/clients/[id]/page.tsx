import React, { Suspense } from "react";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import ClientStatsCard from "@/components/clients/ClientStatsCard";
import ClientCampaignsList from "@/components/clients/ClientCampaignsList";
import ClientActionButtons from "@/components/clients/ClientActionButtons";
import { ClientService } from "@/services/client.service";

export const metadata: Metadata = {
  title: "Détails Client | Admin - TikTok Visibility Platform",
  description: "Détails d'un client de la plateforme",
};

/**
 * Server Action: Suspend or reactivate a client
 */
async function suspendClientAction(formData: FormData) {
  "use server";

  const clientId = formData.get("clientId") as string;

  // Get current client status
  const client = await ClientService.getClientById(clientId);
  if (!client) return;

  // Toggle between suspended and active
  const newStatus = client.user.status === "suspended" ? "active" : "suspended";

  await ClientService.updateClientStatus(clientId, newStatus);

  revalidatePath(`/users/clients/${clientId}`);
  revalidatePath("/users/clients");
}

/**
 * Server Action: Delete a client (soft delete)
 */
async function deleteClientAction(formData: FormData) {
  "use server";

  const clientId = formData.get("clientId") as string;

  await ClientService.deleteClient(clientId);

  revalidatePath("/users/clients");
  redirect("/users/clients");
}

interface ClientDetailsContentProps {
  clientId: string;
}

async function ClientDetailsContent({ clientId }: ClientDetailsContentProps) {
  const client = await ClientService.getClientById(clientId);

  if (!client) {
    notFound();
  }

  const stats = await ClientService.getClientStats(clientId);
  const campaigns = await ClientService.getClientCampaigns(clientId, 10);

  if (!stats) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-error-600 dark:text-error-400">
          Erreur lors du chargement des statistiques
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "pending_verification":
        return "warning";
      case "suspended":
      case "banned":
        return "error";
      default:
        return "light";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Actif";
      case "pending_verification":
        return "En attente de vérification";
      case "suspended":
        return "Suspendu";
      case "banned":
        return "Banni";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Client Info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ComponentCard title="Informations Générales">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {client.user.first_name} {client.user.last_name}
                    </h3>
                    {client.profile.is_verified && (
                      <Badge size="sm" color="success">
                        Vérifié
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {client.user.email}
                  </p>
                  {client.user.phone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {client.user.phone}
                    </p>
                  )}
                </div>
                <Badge size="sm" color={getStatusColor(client.user.status)}>
                  {getStatusLabel(client.user.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {client.profile.company_name && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Entreprise
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {client.profile.company_name}
                    </p>
                  </div>
                )}

                {client.profile.business_type && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Type d&apos;entreprise
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {client.profile.business_type}
                    </p>
                  </div>
                )}

                {client.profile.industry && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Industrie
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {client.profile.industry}
                    </p>
                  </div>
                )}

                {client.user.country && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Pays
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {client.user.country}
                    </p>
                  </div>
                )}

                {client.profile.website && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Site Web
                    </p>
                    <a
                      href={client.profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-brand-500 hover:text-brand-600"
                    >
                      {client.profile.website}
                    </a>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Membre depuis
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {stats.memberSince}
                  </p>
                </div>

                {stats.lastActive && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Dernière connexion
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {stats.lastActive}
                    </p>
                  </div>
                )}
              </div>

              <ClientActionButtons
                clientId={clientId}
                currentStatus={client.user.status}
                onSuspend={suspendClientAction}
                onDelete={deleteClientAction}
              />
            </div>
          </ComponentCard>
        </div>

        <div>
          <ComponentCard title="Statistiques">
            <div className="space-y-3">
              <ClientStatsCard
                label="Total Dépensé"
                value={stats.totalSpentFormatted}
                icon="💰"
                iconBgColor="bg-brand-50 dark:bg-brand-500/10"
              />
              <ClientStatsCard
                label="Solde du Compte"
                value={stats.accountBalanceFormatted}
                icon="💳"
                iconBgColor="bg-success-50 dark:bg-success-500/10"
              />
              <ClientStatsCard
                label="Campagnes Actives"
                value={stats.activeCampaigns}
                icon="🎯"
                iconBgColor="bg-warning-50 dark:bg-warning-500/10"
              />
              <ClientStatsCard
                label="Total Campagnes"
                value={stats.totalCampaigns}
                icon="📊"
                iconBgColor="bg-info-50 dark:bg-info-500/10"
              />
            </div>
          </ComponentCard>
        </div>
      </div>

      {/* Recent Campaigns */}
      <ComponentCard title="Campagnes Récentes">
        <ClientCampaignsList campaigns={campaigns} />
      </ComponentCard>
    </div>
  );
}

function ClientDetailsLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div>
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
    </div>
  );
}

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  return (
    <div>
      <PageBreadcrumb pageTitle="Détails du Client" />
      <Suspense fallback={<ClientDetailsLoading />}>
        <ClientDetailsContent clientId={resolvedParams.id} />
      </Suspense>
    </div>
  );
}
