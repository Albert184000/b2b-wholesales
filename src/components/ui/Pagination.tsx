import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = ''
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 ${className}`}
    >
      <div className="font-medium">
        Showing <span className="font-semibold text-slate-900">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalItems}</span> records
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="xs"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>

        <div className="px-3 py-1 font-semibold text-slate-800 bg-slate-100 rounded-md">
          Page {currentPage} of {Math.max(1, totalPages)}
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next Page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          aria-label="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
