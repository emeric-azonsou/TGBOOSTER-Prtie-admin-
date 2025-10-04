import ComponentCard from "@/components/common/ComponentCard";

export default function TransactionsLoading() {
  return (
    <div>
      <div className="mb-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48"></div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <ComponentCard key={i} title="">
              <div className="animate-pulse space-y-2">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </ComponentCard>
          ))}
        </div>

        <ComponentCard title="Chargement...">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
