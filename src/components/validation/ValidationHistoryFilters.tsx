"use client";

import React, { useState } from "react";
import type { ValidationHistoryFilters } from "@/types/validation-history.types";
import type { TaskType } from "@/types/database.types";

interface ValidationHistoryFiltersProps {
  onFiltersChange: (filters: ValidationHistoryFilters) => void;
  isLoading?: boolean;
}

const taskTypeOptions: Array<{ value: TaskType | "all"; label: string }> = [
  { value: "all", label: "Tous les types" },
  { value: "social_follow", label: "Abonnement" },
  { value: "social_like", label: "Like" },
  { value: "social_share", label: "Partage" },
  { value: "social_comment", label: "Commentaire" },
];

const decisionOptions = [
  { value: "all", label: "Toutes les décisions" },
  { value: "approved", label: "Approuvé" },
  { value: "rejected", label: "Rejeté" },
];

const sortByOptions = [
  { value: "reviewedDate", label: "Date de validation" },
  { value: "submittedDate", label: "Date de soumission" },
  { value: "amount", label: "Montant" },
  { value: "executant", label: "Exécutant" },
  { value: "reviewer", label: "Validateur" },
];

export default function ValidationHistoryFiltersComponent({
  onFiltersChange,
  isLoading = false,
}: ValidationHistoryFiltersProps) {
  const [filters, setFilters] = useState<ValidationHistoryFilters>({
    search: "",
    decision: "all",
    taskType: "all",
    sortBy: "reviewedDate",
    sortOrder: "desc",
    page: 1,
    limit: 20,
  });

  const handleFilterChange = (
    key: keyof ValidationHistoryFilters,
    value: string | number
  ) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, page: 1 });
  };

  const handleResetFilters = () => {
    const defaultFilters: ValidationHistoryFilters = {
      search: "",
      decision: "all",
      taskType: "all",
      sortBy: "reviewedDate",
      sortOrder: "desc",
      page: 1,
      limit: 20,
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="search"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Rechercher
            </label>
            <input
              type="text"
              id="search"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Nom, campagne..."
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="decision"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Décision
            </label>
            <select
              id="decision"
              value={filters.decision || "all"}
              onChange={(e) => handleFilterChange("decision", e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
            >
              {decisionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="taskType"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Type de tâche
            </label>
            <select
              id="taskType"
              value={filters.taskType || "all"}
              onChange={(e) => handleFilterChange("taskType", e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
            >
              {taskTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="sortBy"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Trier par
            </label>
            <div className="flex gap-2">
              <select
                id="sortBy"
                value={filters.sortBy || "reviewedDate"}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
              >
                {sortByOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() =>
                  handleFilterChange(
                    "sortOrder",
                    filters.sortOrder === "asc" ? "desc" : "asc"
                  )
                }
                disabled={isLoading}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                title={
                  filters.sortOrder === "asc" ? "Décroissant" : "Croissant"
                }
              >
                {filters.sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white rounded-md bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
          >
            {isLoading ? "Chargement..." : "Rechercher"}
          </button>

          <button
            type="button"
            onClick={handleResetFilters}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Réinitialiser
          </button>
        </div>
      </form>
    </div>
  );
}
