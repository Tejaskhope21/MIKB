import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  showPageNumbers = true,
  showPageSizeSelector = false,
  showItemsCount = true,
  showFirstLastButtons = true,
  showPreviousNext = true,
  siblingCount = 1,
  variant = "default",
  size = "md",
  className = "",
  disabled = false,
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      button: "h-8 px-2 text-sm",
      select: "h-8 px-2 text-sm",
      text: "text-sm",
      icon: "h-3 w-3",
    },
    md: {
      button: "h-10 px-3",
      select: "h-10 px-2",
      text: "text-sm",
      icon: "h-4 w-4",
    },
    lg: {
      button: "h-12 px-4 text-base",
      select: "h-12 px-3 text-base",
      text: "text-base",
      icon: "h-5 w-5",
    },
  };

  // Variant configurations
  const variantConfig = {
    default: {
      active: "bg-blue-600 text-white border-blue-600",
      inactive: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
      disabled: "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed",
    },
    minimal: {
      active: "bg-gray-800 text-white border-gray-800",
      inactive: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
      disabled: "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed",
    },
    outline: {
      active: "bg-white text-blue-600 border-blue-600",
      inactive: "bg-white text-gray-700 border-gray-300 hover:border-gray-400",
      disabled: "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed",
    },
    filled: {
      active: "bg-blue-100 text-blue-700 border-blue-200",
      inactive: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200",
      disabled: "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed",
    },
  };

  const sizes = sizeConfig[size] || sizeConfig.md;
  const variants = variantConfig[variant] || variantConfig.default;

  // Calculate page numbers to display
  const generatePageNumbers = () => {
    const totalPageNumbers = siblingCount * 2 + 3; // siblings + first/last + current + dots
    const totalBlocks = totalPageNumbers + 2; // totalPageNumbers + first/last dots

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from(
        { length: leftItemCount },
        (_, i) => i + 1
      );
      return [...leftRange, "...", totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, "...", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage || disabled) {
      return;
    }
    onPageChange?.(page);
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    onPageChange?.(1, newSize);
  };

  const pageNumbers = generatePageNumbers();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const renderPageButton = (page, index) => {
    if (page === "...") {
      return (
        <span
          key={`dots-${index}`}
          className={`${sizes.button} flex items-center justify-center ${variants.inactive}`}
        >
          <MoreHorizontal className={sizes.icon} />
        </span>
      );
    }

    const isActive = page === currentPage;
    return (
      <button
        key={page}
        onClick={() => handlePageChange(page)}
        disabled={disabled || isActive}
        className={`${sizes.button} min-w-[2.5rem] border rounded-md flex items-center justify-center transition-colors ${
          isActive
            ? variants.active
            : disabled
            ? variants.disabled
            : variants.inactive
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        aria-current={isActive ? "page" : undefined}
        aria-label={`Go to page ${page}`}
      >
        {page}
      </button>
    );
  };

  const renderPageSizeSelector = () => {
    if (!showPageSizeSelector) return null;

    const pageSizeOptions = [10, 25, 50, 100];

    return (
      <div className="flex items-center space-x-2">
        <span className={`text-gray-600 ${sizes.text}`}>Show:</span>
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          disabled={disabled}
          className={`${sizes.select} border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className={`text-gray-600 ${sizes.text}`}>per page</span>
      </div>
    );
  };

  const renderItemsCount = () => {
    if (!showItemsCount || totalItems === 0) return null;

    return (
      <div className={`text-gray-600 ${sizes.text}`}>
        Showing {startItem} to {endItem} of {totalItems.toLocaleString()} results
      </div>
    );
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 ${className}`}>
      {/* Left side - Items count and page size selector */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
        {renderItemsCount()}
        {renderPageSizeSelector()}
      </div>

      {/* Center - Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* First page button */}
        {showFirstLastButtons && (
          <button
            onClick={() => handlePageChange(1)}
            disabled={disabled || currentPage === 1}
            className={`${sizes.button} border rounded-md flex items-center justify-center transition-colors ${
              disabled || currentPage === 1
                ? variants.disabled
                : variants.inactive
            } ${disabled || currentPage === 1 ? "cursor-not-allowed" : "cursor-pointer"}`}
            aria-label="Go to first page"
          >
            <ChevronsLeft className={sizes.icon} />
          </button>
        )}

        {/* Previous page button */}
        {showPreviousNext && (
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={disabled || currentPage === 1}
            className={`${sizes.button} border rounded-md flex items-center justify-center transition-colors ${
              disabled || currentPage === 1
                ? variants.disabled
                : variants.inactive
            } ${disabled || currentPage === 1 ? "cursor-not-allowed" : "cursor-pointer"}`}
            aria-label="Go to previous page"
          >
            <ChevronLeft className={sizes.icon} />
          </button>
        )}

        {/* Page numbers */}
        {showPageNumbers && pageNumbers && (
          <div className="flex items-center space-x-1">
            {pageNumbers.map((page, index) => renderPageButton(page, index))}
          </div>
        )}

        {/* Next page button */}
        {showPreviousNext && (
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={disabled || currentPage === totalPages}
            className={`${sizes.button} border rounded-md flex items-center justify-center transition-colors ${
              disabled || currentPage === totalPages
                ? variants.disabled
                : variants.inactive
            } ${disabled || currentPage === totalPages ? "cursor-not-allowed" : "cursor-pointer"}`}
            aria-label="Go to next page"
          >
            <ChevronRight className={sizes.icon} />
          </button>
        )}

        {/* Last page button */}
        {showFirstLastButtons && (
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={disabled || currentPage === totalPages}
            className={`${sizes.button} border rounded-md flex items-center justify-center transition-colors ${
              disabled || currentPage === totalPages
                ? variants.disabled
                : variants.inactive
            } ${disabled || currentPage === totalPages ? "cursor-not-allowed" : "cursor-pointer"}`}
            aria-label="Go to last page"
          >
            <ChevronsRight className={sizes.icon} />
          </button>
        )}
      </div>

      {/* Right side - Page info */}
      <div className={`text-gray-600 ${sizes.text} text-center sm:text-right`}>
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;