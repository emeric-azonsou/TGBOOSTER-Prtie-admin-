"use client";

import React from "react";

interface LogsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function LogsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: LogsPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter((page) => {
    if (totalPages <= 7) return true;
    if (page === 1 || page === totalPages) return true;
    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
    return false;
  });

  return (
    <div className="mt-6 flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Précédent
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {visiblePages.map((page, index) => {
            const prevPage = visiblePages[index - 1];
            const showEllipsis = prevPage && page - prevPage > 1;

            return (
              <React.Fragment key={page}>
                {showEllipsis && (
                  <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                )}
                <button
                  onClick={() => onPageChange(page)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    currentPage === page
                      ? "bg-brand-500 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Suivant
        </button>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        Page {currentPage} sur {totalPages}
      </div>
    </div>
  );
}
