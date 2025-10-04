interface FinancialStatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  bgColor: string;
  textColor?: string;
}

export default function FinancialStatsCard({
  title,
  value,
  subtitle,
  icon,
  bgColor,
  textColor = "text-gray-900 dark:text-white",
}: FinancialStatsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between mb-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          {title}
        </p>
        <h3 className={`text-2xl font-bold ${textColor}`}>
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
