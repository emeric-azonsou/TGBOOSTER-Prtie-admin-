/**
 * ValidationExecutantInfo - Display executant information
 */

import ComponentCard from "@/components/common/ComponentCard";
import Link from "next/link";
import type { PendingTaskExecution } from "@/types/validation.types";

interface ValidationExecutantInfoProps {
  task: PendingTaskExecution;
}

export default function ValidationExecutantInfo({ task }: ValidationExecutantInfoProps) {
  return (
    <ComponentCard title="Profil Exécutant">
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Nom
          </p>
          <Link
            href={`/users/executants/${task.executant_id}`}
            className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            {task.executant_name}
          </Link>
        </div>

        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Email
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
            {task.executant_email}
          </p>
        </div>

        <div>
          <Link
            href={`/users/executants/${task.executant_id}`}
            className="block px-3 py-2 text-xs font-medium text-center text-brand-600 bg-brand-50 rounded hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20 transition-colors"
          >
            Voir le profil complet
          </Link>
        </div>
      </div>
    </ComponentCard>
  );
}
