import React from "react";

export function SkeletonLoader() {
  return (
    <div className="p-6 space-y-8 animate-pulse w-full max-w-7xl mx-auto">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-850">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
          <div className="h-4 w-40 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
          <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
        </div>
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="p-4 bg-gray-200 dark:bg-gray-800 rounded-lg space-y-3 border border-gray-300 dark:border-gray-700 h-28">
            <div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-8 w-2/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-3 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 bg-gray-200 dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 h-80 flex flex-col justify-between">
            <div className="h-5 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-44 w-full bg-gray-300 dark:bg-gray-700 rounded mt-4"></div>
          </div>
        ))}
      </div>

      {/* Alerts and Tables Skeletons */}
      <div className="space-y-6">
        <div className="p-6 bg-gray-200 dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 space-y-4">
          <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="space-y-2">
            <div className="h-12 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-12 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SkeletonLoader;
