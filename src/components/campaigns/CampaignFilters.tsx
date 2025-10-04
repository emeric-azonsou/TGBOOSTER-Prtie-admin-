/**
 * CampaignFilters - Filter and search component for campaigns list
 */

"use client";

import { useState } from "react";
import type { TaskType, TaskStatus, TaskPriority } from "@/types/campaign.types";

interface CampaignFiltersProps {
  onFilterChange: (filters: {
    search?: string;
    status?: TaskStatus | "all";
    type?: TaskType | "all";
    priority?: TaskPriority | "all";
  }) => void;
}

export default function CampaignFilters({ onFilterChange }: CampaignFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [type, setType] = useState<TaskType | "all">("all");
  const [priority, setPriority] = useState<TaskPriority | "all">("all");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({ search: value, status, type, priority });
  };

  const handleStatusChange = (value: TaskStatus | "all") => {
    setStatus(value);
    onFilterChange({ search, status: value, type, priority });
  };

  const handleTypeChange = (value: TaskType | "all") => {
    setType(value);
    onFilterChange({ search, status, type: value, priority });
  };

  const handlePriorityChange = (value: TaskPriority | "all") => {
    setPriority(value);
    onFilterChange({ search, status, type, priority: value });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={type}
        onChange={(e) => handleTypeChange(e.target.value as TaskType | "all")}
        className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
      >
        <option value="all">Tous les types</option>
        <option value="social_follow">Abonnement</option>
        <option value="social_like">Like</option>
        <option value="social_share">Partage</option>
        <option value="social_comment">Commentaire</option>
        <option value="app_download">Téléchargement</option>
        <option value="website_visit">Visite</option>
        <option value="survey">Sondage</option>
        <option value="review">Avis</option>
      </select>

      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value as TaskStatus | "all")}
        className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
      >
        <option value="all">Tous les statuts</option>
        <option value="draft">Brouillon</option>
        <option value="active">Active</option>
        <option value="paused">En pause</option>
        <option value="completed">Terminée</option>
        <option value="cancelled">Annulée</option>
      </select>

      <select
        value={priority}
        onChange={(e) => handlePriorityChange(e.target.value as TaskPriority | "all")}
        className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
      >
        <option value="all">Toutes les priorités</option>
        <option value="low">Basse</option>
        <option value="normal">Normale</option>
        <option value="high">Haute</option>
        <option value="urgent">Urgente</option>
      </select>

      <input
        type="text"
        placeholder="Rechercher une campagne..."
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
      />
    </div>
  );
}
