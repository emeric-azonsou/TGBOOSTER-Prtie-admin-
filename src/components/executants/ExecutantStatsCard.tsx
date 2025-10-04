/**
 * ExecutantStatsCard - Reusable stat card for executant metrics
 */

interface ExecutantStatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  iconBgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function ExecutantStatsCard({
  label,
  value,
  icon,
  iconBgColor = "bg-brand-50 dark:bg-brand-500/10",
  trend,
}: ExecutantStatsCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-lg ${iconBgColor}`}
      >
        <span className="text-xl">{icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-gray-800 dark:text-white/90">
            {value}
          </p>
          {trend && (
            <span
              className={`text-xs font-medium ${
                trend.isPositive
                  ? "text-success-600 dark:text-success-500"
                  : "text-error-600 dark:text-error-500"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
