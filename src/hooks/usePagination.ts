import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  initialPageSize?: number;
  initialPage?: number;
}

interface UsePaginationResult<T> {
  // Current page data
  currentData: T[];
  
  // Pagination state
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  
  // Pagination controls
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  
  // Helpers
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startItem: number;
  endItem: number;
}

export function usePagination<T>({
  data,
  initialPageSize = 10, // Smaller default to reduce whitespace
  initialPage = 1
}: UsePaginationProps<T>): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Calculate current page data
  const currentData = useMemo(() => {
    if (pageSize >= totalItems) {
      // Show all items if page size is >= total items
      return data;
    }
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize, totalItems]);

  // Calculate item positions
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Navigation helpers
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToNextPage = () => {
    if (hasNextPage) setCurrentPage(currentPage + 1);
  };
  const goToPrevPage = () => {
    if (hasPrevPage) setCurrentPage(currentPage - 1);
  };

  // Handle page size changes
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    
    // Adjust current page to maintain roughly the same position
    if (newSize >= totalItems) {
      setCurrentPage(1);
    } else {
      const currentFirstItem = (currentPage - 1) * pageSize + 1;
      const newPage = Math.ceil(currentFirstItem / newSize);
      setCurrentPage(Math.max(1, Math.min(newPage, Math.ceil(totalItems / newSize))));
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    // Current page data
    currentData,
    
    // Pagination state
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    
    // Pagination controls
    setCurrentPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPrevPage,
    
    // Helpers
    hasNextPage,
    hasPrevPage,
    startItem,
    endItem
  };
}