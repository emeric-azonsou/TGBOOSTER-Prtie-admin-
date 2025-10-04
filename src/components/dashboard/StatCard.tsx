import React from "react";
import Badge from "@/components/ui/badge/Badge";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: string;
  iconBgColor: string;
  trendLabel?: string;
}

export default function StatCard({
  title,
  value,
  trend,
  icon,
  iconBgColor,
  trendLabel,
}: StatCardProps) {
  const trendColor = trend && trend > 0 ? "success" : trend && trend < 0 ? "error" : "light";
  const trendText = trend && trend > 0 ? `+${trend}%` : trend ? `${trend}%` : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center justify-center w-12 h-12 ${iconBgColor} rounded-xl`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      <div>
        <h4 className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">
          {value}
        </h4>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {title}
        </span>
      </div>
      {trendText && (
        <div className="mt-3">
          <Badge color={trendColor} size="sm">
            {trendText} {trendLabel || ""}
          </Badge>
        </div>
      )}
    </div>
  );
}
