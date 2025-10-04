import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import Badge from "@/components/ui/badge/Badge";
import { WithdrawalService } from "@/services/withdrawal.service";
import WithdrawalProcessForm from "@/components/finances/WithdrawalProcessForm";

export const metadata: Metadata = {
  title: "Vérifier Retrait | Admin - TikTok Visibility Platform",
  description: "Vérification et traitement d'une demande de retrait",
};

const getStatusBadgeColor = (
  status: string
): "success" | "warning" | "error" | "default" => {
  switch (status) {
    case "completed":
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "error";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: "En attente",
    approved: "Approuvé",
    rejected: "Rejeté",
    completed: "Complété",
  };
  return labels[status] || status;
};

const getPaymentMethodLabel = (method: string, provider?: string): string => {
  if (method === "mobile_money" && provider) {
    const providers: Record<string, string> = {
      mtn_momo: "MTN MoMo",
      moov_money: "Moov Money",
      celtiis_cash: "Celtiis Cash",
    };
    return providers[provider] || provider;
  }
  const methods: Record<string, string> = {
    card: "Carte bancaire",
    mobile_money: "Mobile Money",
    bank_transfer: "Virement bancaire",
  };
  return methods[method] || method;
};

export default async function WithdrawalVerificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const withdrawal = await WithdrawalService.getWithdrawalById(id);

  if (!withdrawal) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Retrait non trouvé" />
        <ComponentCard title="Erreur">
          <p className="text-gray-600 dark:text-gray-400">
            Cette demande de retrait n'existe pas ou a été supprimée.
          </p>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Vérifier la Demande de Retrait" />
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <ComponentCard title="Détails de la Demande">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {withdrawal.withdrawal_id}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Demandé {withdrawal.requested_at_relative}
                    </p>
                  </div>
                  <Badge size="sm" color={getStatusBadgeColor(withdrawal.status)}>
                    {getStatusLabel(withdrawal.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-brand-50 rounded-lg dark:bg-brand-500/10">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Montant Demandé
                    </p>
                    <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                      {withdrawal.amount_formatted}
                    </p>
                  </div>
                  <div className="p-4 bg-success-50 rounded-lg dark:bg-success-500/10">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Solde Disponible
                    </p>
                    <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                      {withdrawal.executant_stats.available_balance_formatted}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-3">
                    Informations de Paiement
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Méthode de Paiement
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {getPaymentMethodLabel(withdrawal.payment_method, withdrawal.mobile_money_provider)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Numéro
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {withdrawal.mobile_money_number || withdrawal.bank_account_number}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-warning-50 rounded-lg dark:bg-warning-500/10">
                  <h4 className="text-sm font-medium text-warning-800 dark:text-warning-400 mb-2">
                    ⚠️ Points de Vérification
                  </h4>
                  <ul className="space-y-2 text-sm text-warning-700 dark:text-warning-300">
                    <li className="flex items-center gap-2">
                      <span className={withdrawal.executant_stats.available_balance_cents >= withdrawal.amount_cents ? "text-success-600" : "text-error-600"}>
                        {withdrawal.executant_stats.available_balance_cents >= withdrawal.amount_cents ? "✓" : "✗"}
                      </span>
                      Solde suffisant disponible
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={withdrawal.executant_verified ? "text-success-600" : "text-error-600"}>
                        {withdrawal.executant_verified ? "✓" : "✗"}
                      </span>
                      Compte vérifié
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-success-600">✓</span>
                      Dernier retrait: {withdrawal.executant_stats.last_withdrawal_relative || "Jamais"}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-success-600">✓</span>
                      Taux de validation: {withdrawal.executant_stats.validation_rate}%
                    </li>
                  </ul>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="Traitement de la Demande">
              <WithdrawalProcessForm withdrawalId={withdrawal.withdrawal_id} />
            </ComponentCard>
          </div>

          <div className="space-y-6">
            <ComponentCard title="Profil Exécutant">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Nom
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {withdrawal.executant_name}
                    </p>
                    {withdrawal.executant_verified && (
                      <Badge size="sm" color="success">
                        ✓
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {withdrawal.executant_email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Téléphone
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {withdrawal.executant_phone}
                  </p>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="Statistiques">
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Gagné
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                    {withdrawal.executant_stats.total_earned_formatted}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Retiré
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                    {withdrawal.executant_stats.total_withdrawn_formatted}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tâches Complétées
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                    {withdrawal.executant_stats.tasks_completed}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Taux Validation
                  </p>
                  <p className="text-lg font-bold text-success-600 dark:text-success-400">
                    {withdrawal.executant_stats.validation_rate}%
                  </p>
                </div>
              </div>
            </ComponentCard>
          </div>
        </div>
      </div>
    </div>
  );
}
