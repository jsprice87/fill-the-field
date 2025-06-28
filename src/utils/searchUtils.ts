
import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useSearchQuery = (paramName: string = 'q') => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const query = searchParams.get(paramName) || '';
  
  const setQuery = useCallback((newQuery: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (newQuery.trim()) {
      newParams.set(paramName, newQuery.trim());
    } else {
      newParams.delete(paramName);
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams, paramName]);

  return { query, setQuery };
};

// Debounce utility
export const useDebounce = <T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  return React.useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }) as T,
    [callback, delay]
  );
};

// Search filtering functions
export const searchInText = (text: string | null | undefined, query: string): boolean => {
  if (!text || !query) return false;
  return text.toLowerCase().includes(query.toLowerCase());
};

export const searchInDate = (dateString: string | null | undefined, query: string): boolean => {
  if (!dateString || !query) return false;
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  return formattedDate.toLowerCase().includes(query.toLowerCase());
};
