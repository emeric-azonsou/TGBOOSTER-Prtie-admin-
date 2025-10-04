/**
 * Formatters - Pure utility functions for formatting data
 */

import type { TaskType, TaskStatus, TaskPriority } from "@/types/campaign.types";

/**
 * Format currency (cents to FCFA)
 */
export function formatCurrency(cents: number): string {
  const fcfa = Math.floor(cents / 100);
  return `${fcfa.toLocaleString("fr-FR")} FCFA`;
}

/**
 * Format date to French format
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format relative time in French
 */
export function formatRelativeTime(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "Il y a moins d'une minute";
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
}

/**
 * Format task type to French
 */
export function formatTaskType(type: TaskType): string {
  const typeMap: Record<TaskType, string> = {
    social_follow: "Abonnement",
    social_like: "Like",
    social_share: "Partage",
    social_comment: "Commentaire",
    app_download: "Téléchargement",
    website_visit: "Visite",
    survey: "Sondage",
    review: "Avis",
  };
  return typeMap[type] || type;
}

/**
 * Format task status to French
 */
export function formatTaskStatus(status: TaskStatus): string {
  const statusMap: Record<TaskStatus, string> = {
    draft: "Brouillon",
    active: "Active",
    paused: "En pause",
    completed: "Terminée",
    cancelled: "Annulée",
  };
  return statusMap[status] || status;
}

/**
 * Format task priority to French
 */
export function formatTaskPriority(priority: TaskPriority): string {
  const priorityMap: Record<TaskPriority, string> = {
    low: "Basse",
    normal: "Normale",
    high: "Haute",
    urgent: "Urgente",
  };
  return priorityMap[priority] || priority;
}
