"use client";

import React, { useState } from "react";
import { LogAction, EntityType } from "@/types/system.types";

interface LogsFilterProps {
  onFilterChange: (filters: {
    action?: LogAction;
    entity_type?: EntityType;
    date_from?: string;
    date_to?: string;
    search?: string;
  }) => void;
}

export default function LogsFilter({ onFilterChange }: LogsFilterProps) {
  const [action, setAction] = useState<LogAction | "">("");
  const [entityType, setEntityType] = useState<EntityType | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  const handleApplyFilters = () => {
    onFilterChange({
      action: action || undefined,
      entity_type: entityType || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      search: search || undefined,
    });
  };

  const handleReset = () => {
    setAction("");
    setEntityType("");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    onFilterChange({});
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
        Filtres
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Action
          </label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as LogAction)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Toutes les actions</option>
            <option value="user_created">Création utilisateur</option>
            <option value="user_updated">Modification utilisateur</option>
            <option value="user_suspended">Suspension utilisateur</option>
            <option value="user_banned">Bannissement utilisateur</option>
            <option value="task_validated">Validation tâche</option>
            <option value="task_rejected">Rejet tâche</option>
            <option value="task_created">Création tâche</option>
            <option value="task_updated">Modification tâche</option>
            <option value="dispute_created">Création litige</option>
            <option value="dispute_resolved">Résolution litige</option>
            <option value="withdrawal_approved">Approbation retrait</option>
            <option value="withdrawal_rejected">Rejet retrait</option>
            <option value="payment_processed">Traitement paiement</option>
            <option value="admin_login">Connexion admin</option>
            <option value="admin_logout">Déconnexion admin</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Type d&apos;entité
          </label>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value as EntityType)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Toutes les entités</option>
            <option value="user">Utilisateur</option>
            <option value="task">Tâche</option>
            <option value="task_execution">Exécution de tâche</option>
            <option value="dispute">Litige</option>
            <option value="withdrawal">Retrait</option>
            <option value="payment">Paiement</option>
            <option value="system_config">Configuration</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recherche
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date de début
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date de fin
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={handleApplyFilters}
            className="flex-1 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none"
          >
            Appliquer
          </button>
          <button
            onClick={handleReset}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}
