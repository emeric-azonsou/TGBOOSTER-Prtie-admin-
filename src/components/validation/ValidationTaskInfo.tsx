/**
 * ValidationTaskInfo - Display task information
 */

import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import Link from "next/link";
import type { PendingTaskExecution } from "@/types/validation.types";

interface ValidationTaskInfoProps {
  task: PendingTaskExecution;
}

export default function ValidationTaskInfo({ task }: ValidationTaskInfoProps) {
  return (
    <ComponentCard title="Informations Tâche">
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ID Exécution
          </p>
          <p className="text-sm font-mono text-gray-800 dark:text-white/90 break-all">
            {task.execution_id.substring(0, 8)}...
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Campagne
          </p>
          <Link
            href={`/campaigns/${task.campaign_id}`}
            className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            {task.campaign_title}
          </Link>
        </div>

        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Type de Tâche
          </p>
          <Badge size="sm" color="info">
            {task.task_type_label}
          </Badge>
        </div>

        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Montant
          </p>
          <p className="text-sm font-bold text-success-600 dark:text-success-400">
            {task.reward_formatted}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Soumis
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {task.submitted_at_relative}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {new Date(task.submitted_at).toLocaleString("fr-FR")}
          </p>
        </div>
      </div>
    </ComponentCard>
  );
}
