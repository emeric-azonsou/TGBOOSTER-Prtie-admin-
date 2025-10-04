import React from "react";

interface ClientStatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  trend?: {
    value: number;
    label: string;
  };
}

export default function ClientStatsCard({
  label,
  value,
  icon,
  iconBgColor,
  trend,
}: ClientStatsCardProps) {
  return (
    <div className="p-4 rounded-lg bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
            {value}
          </p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.value >= 0 ? "text-success-600 dark:text-success-400" : "text-error-600 dark:text-error-400"}`}>
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={`flex items-center justify-center w-10 h-10 ${iconBgColor} rounded-lg`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}
