import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Créer Campagne | Admin - TikTok Visibility Platform",
  description: "Créer une nouvelle campagne",
};

export default function CreateCampaignPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Créer une Campagne" />
      <div className="space-y-6">
        <ComponentCard title="Informations de la Campagne">
          <form className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Titre de la Campagne
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Ex: Promotion Album 2024"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Client
                </label>
                <select className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                  <option>Sélectionnez un client</option>
                  <option>Marie Kouassi - Fashion Brand BJ</option>
                  <option>Jean Ahouandjinou - Music Label</option>
                  <option>Fatou Diallo - Restaurant</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type de Campagne
                </label>
                <select className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                  <option>Sélectionnez un type</option>
                  <option>Followers</option>
                  <option>Views</option>
                  <option>Likes</option>
                  <option>Comments</option>
                  <option>Challenge</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  URL TikTok Cible
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="https://www.tiktok.com/@username/video/..."
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantité Requise
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Récompense par Action (FCFA)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="35"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Budget Total (FCFA)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="120000"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Priorité
                </label>
                <select className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                  <option>Normal</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date de Début
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date de Fin
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Instructions pour les Exécutants
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Décrivez les instructions détaillées..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Approuver automatiquement les tâches
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
              >
                Créer la Campagne
              </button>
              <button
                type="button"
                className="px-6 py-2 text-sm font-medium text-white bg-success-500 rounded-lg hover:bg-success-600 transition-colors"
              >
                Créer et Activer
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
    </div>
  );
}
