/**
 * Task Validation Detail Page - View proof and validate/reject with video support
 */

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ValidationProofViewer from "@/components/validation/ValidationProofViewer";
import ValidationExecutantInfo from "@/components/validation/ValidationExecutantInfo";
import ValidationTaskInfo from "@/components/validation/ValidationTaskInfo";
import ValidationActions from "@/components/validation/ValidationActions";
import { ValidationService } from "@/services/validation.service";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Validation Tâche | Admin`,
    description: `Validation de la preuve pour la tâche ${id}`,
  };
}

export default async function ValidationDetailPage({ params }: PageProps) {
  const { id: executionId } = await params;

  const { tasks } = await ValidationService.getPendingTasks({
    limit: 100,
    page: 1,
  });

  const task = tasks.find(t => t.execution_id === executionId);

  if (!task) {
    notFound();
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Validation de Tâche" />

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ComponentCard title="Preuve Soumise">
              <ValidationProofViewer task={task} />
            </ComponentCard>
          </div>

          <div className="space-y-6">
            <ValidationTaskInfo task={task} />
            <ValidationExecutantInfo task={task} />
          </div>
        </div>

        <ComponentCard title="Actions de Validation">
          <ValidationActions task={task} />
        </ComponentCard>
      </div>
    </div>
  );
}
