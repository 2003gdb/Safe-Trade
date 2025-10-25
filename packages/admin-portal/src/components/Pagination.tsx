'use client';

import { es } from '../locales/es';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, totalResults, onPageChange }: PaginationProps) {
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-safetrade-blue/30 text-sm font-medium text-safetrade-dark bg-white hover:bg-safetrade-blue/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {es.reports.pagination.previous}
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-safetrade-blue/30 text-sm font-medium text-safetrade-dark bg-white hover:bg-safetrade-blue/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {es.reports.pagination.next}
        </button>
      </div>

      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-safetrade-dark">
            Mostrando{' '}
            <span className="font-medium">{((currentPage - 1) * 10) + 1}</span>
            {' '}al{' '}
            <span className="font-medium">
              {Math.min(currentPage * 10, totalResults)}
            </span>
            {' '}{es.reports.pagination.of}{' '}
            <span className="font-medium">{totalResults}</span>
            {' '}{es.reports.pagination.results}
          </p>
        </div>

        <div>
          <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Pagination">
            {}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 border border-safetrade-blue/30 bg-white text-sm font-medium text-safetrade-dark/70 hover:bg-safetrade-blue/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">{es.reports.pagination.previous}</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {}
            {generatePageNumbers().map((page, index) => (
              <span key={index}>
                {page === '...' ? (
                  <span className="relative inline-flex items-center px-4 py-2 border border-safetrade-blue/30 bg-white text-sm font-medium text-safetrade-dark">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === page
                        ? 'z-10 bg-safetrade-orange/10 border-safetrade-orange text-safetrade-orange'
                        : 'bg-white border-safetrade-blue/30 text-safetrade-dark/70 hover:bg-safetrade-blue/10'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </span>
            ))}

            {}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 border border-safetrade-blue/30 bg-white text-sm font-medium text-safetrade-dark/70 hover:bg-safetrade-blue/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">{es.reports.pagination.next}</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}