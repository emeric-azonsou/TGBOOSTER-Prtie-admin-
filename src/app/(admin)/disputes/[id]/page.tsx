import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import Badge from "@/components/ui/badge/Badge";

export const metadata: Metadata = {
  title: "Examiner Litige | Admin - TikTok Visibility Platform",
  description: "Examen et résolution d'un litige",
};

export default function DisputeDetailsPage() {
  const dispute = {
    id: "DISP-001",
    client: "Fatou Diallo",
    clientEmail: "fatou.d@example.com",
    executant: "Moussa Traoré",
    executantEmail: "moussa.t@example.com",
    campaign: "Promo Restaurant",
    taskType: "View",
    reason: "Preuve insuffisante",
    description:
      "Le client conteste la validité de la preuve soumise. La capture d'écran ne montre pas clairement le temps de visionnage requis (30 secondes minimum).",
    amount: "17 FCFA",
    submittedDate: "Il y a 6h",
    priority: "High",
    status: "En cours",
    proofUrl: "https://example.com/proof.jpg",
    clientComments:
      "La capture d'écran ne démontre pas que la vidéo a été visionnée pendant au moins 30 secondes comme requis.",
    executantComments:
      "J'ai bien visionné la vidéo complète. La capture montre la fin de la vidéo.",
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Examiner le Litige" />
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <ComponentCard title="Détails du Litige">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {dispute.id}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {dispute.campaign}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge size="sm" color="error">
                      {dispute.priority}
                    </Badge>
                    <Badge size="sm" color="warning">
                      {dispute.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">
                    Motif du Litige
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {dispute.reason}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {dispute.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-brand-50 rounded-lg dark:bg-brand-500/10">
                    <h4 className="text-xs font-medium text-brand-800 dark:text-brand-400 mb-2">
                      Commentaires Client
                    </h4>
                    <p className="text-sm text-brand-700 dark:text-brand-300">
                      {dispute.clientComments}
                    </p>
                  </div>
                  <div className="p-4 bg-success-50 rounded-lg dark:bg-success-500/10">
                    <h4 className="text-xs font-medium text-success-800 dark:text-success-400 mb-2">
                      Commentaires Exécutant
                    </h4>
                    <p className="text-sm text-success-700 dark:text-success-300">
                      {dispute.executantComments}
                    </p>
                  </div>
                </div>

                <div className="aspect-video bg-gray-100 rounded-lg dark:bg-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Preuve contestée
                    </p>
                    <a
                      href={dispute.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors inline-block"
                    >
                      Voir la preuve
                    </a>
                  </div>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="Résolution du Litige">
              <form className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Décision
                  </label>
                  <select className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                    <option>Sélectionnez une décision</option>
                    <option>Approuver la tâche - En faveur de l&apos;exécutant</option>
                    <option>Rejeter la tâche - En faveur du client</option>
                    <option>
                      Partage du montant - Compromis (50/50)
                    </option>
                    <option>Demander plus d&apos;informations</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notes de Résolution
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Expliquez votre décision en détail..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Appliquer une sanction à l&apos;exécutant
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-success-500 rounded-lg hover:bg-success-600 transition-colors"
                  >
                    Résoudre le Litige
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 text-sm font-medium text-white bg-error-500 rounded-lg hover:bg-error-600 transition-colors"
                  >
                    Escalader
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </ComponentCard>
          </div>

          <div className="space-y-6">
            <ComponentCard title="Information Tâche">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Type de Tâche
                  </p>
                  <Badge size="sm" color="info">
                    {dispute.taskType}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Montant en Jeu
                  </p>
                  <p className="text-sm font-bold text-warning-600 dark:text-warning-400">
                    {dispute.amount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Date de Soumission
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {dispute.submittedDate}
                  </p>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="Client">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {dispute.client}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {dispute.clientEmail}
                </p>
                <button className="w-full px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 transition-colors">
                  Voir Profil
                </button>
              </div>
            </ComponentCard>

            <ComponentCard title="Exécutant">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {dispute.executant}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {dispute.executantEmail}
                </p>
                <button className="w-full px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 transition-colors">
                  Voir Profil
                </button>
              </div>
            </ComponentCard>
          </div>
        </div>
      </div>
    </div>
  );
}
