import ComponentCard from "@/components/common/ComponentCard";

export default function AllCampaignsLoading() {
  return (
    <div>
      <div className="mb-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-56"></div>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Chargement...">
          <div className="space-y-4">
            {/* Filters skeleton */}
            <div className="flex gap-4 animate-pulse">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>

            {/* Table skeleton */}
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
