import ComponentCard from "@/components/common/ComponentCard";

export default function PendingValidationLoading() {
  return (
    <div>
      <div className="mb-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-56"></div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
            </div>
          ))}
        </div>

        <ComponentCard title="Chargement...">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            ))}
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
