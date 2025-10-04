import ComponentCard from "@/components/common/ComponentCard";

export default function SanctionsLoading() {
  return (
    <div>
      <div className="mb-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48"></div>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Chargement...">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
