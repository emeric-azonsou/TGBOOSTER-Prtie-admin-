import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ExecutantProfileHeader from "@/components/executants/details/ExecutantProfileHeader";
import ExecutantStatsCards from "@/components/executants/details/ExecutantStatsCards";
import ExecutantTasksTable from "@/components/executants/details/ExecutantTasksTable";
import { ExecutantService } from "@/services/executant.service";

interface ExecutantDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ExecutantDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const executant = await ExecutantService.getExecutantById(id);

  if (!executant) {
    return {
      title: "Exécutant non trouvé | Admin",
    };
  }

  return {
    title: `${executant.user.first_name} ${executant.user.last_name} | Exécutants`,
    description: `Profil détaillé de l'exécutant ${executant.user.first_name} ${executant.user.last_name}`,
  };
}

export default async function ExecutantProfilePage({
  params,
}: ExecutantDetailsPageProps) {
  const { id } = await params;
  const executant = await ExecutantService.getExecutantById(id);

  if (!executant) {
    notFound();
  }

  const stats = await ExecutantService.getExecutantStats(id);
  const tasks = await ExecutantService.getExecutantTasks(id, 10);

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle={`${executant.user.first_name} ${executant.user.last_name}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExecutantProfileHeader executant={executant} />
        </div>

        <div>
          {stats && <ExecutantStatsCards stats={stats} />}
        </div>
      </div>

      <ComponentCard title="Historique des Tâches">
        <ExecutantTasksTable tasks={tasks} />
      </ComponentCard>
    </div>
  );
}
