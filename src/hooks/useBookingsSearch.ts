
import { useMemo, useState, useEffect } from 'react';
import { Booking } from '@/types';
import { useSearchQuery, useDebounce, searchInText, searchInDate } from '@/utils/searchUtils';

export const useBookingsSearch = (bookings: Booking[], includeArchived: boolean = false) => {
  const { query, setQuery } = useSearchQuery();
  const [searchTerm, setSearchTerm] = useState(query);

  // Debounced search handler
  const debouncedSetQuery = useDebounce(setQuery, 250);

  // Update search term when URL query changes (e.g., on page load)
  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedSetQuery(value);
  };

  // Filter bookings based on search query only (archive filtering now done in useBookings)
  const filteredBookings = useMemo(() => {
    // Early return if no search query
    if (!query.trim()) return bookings;

    const searchQuery = query.trim().toLowerCase();
    
    return bookings.filter(booking => {
      // Optimized search with early returns and lower case comparison
      const parentName = `${booking.parent_first_name || ''} ${booking.parent_last_name || ''}`.toLowerCase();
      const participantName = booking.participants?.[0]?.first_name?.toLowerCase() || '';
      const locationName = booking.class_schedules?.classes?.locations?.name?.toLowerCase() || '';
      const className = booking.class_schedules?.classes?.class_name?.toLowerCase() || '';
      const status = booking.status?.toLowerCase() || '';
      const age = booking.participants?.[0]?.age?.toString() || '';
      
      return (
        parentName.includes(searchQuery) ||
        participantName.includes(searchQuery) ||
        locationName.includes(searchQuery) ||
        className.includes(searchQuery) ||
        status.includes(searchQuery) ||
        age.includes(searchQuery) ||
        searchInDate(booking.selected_date, searchQuery) ||
        searchInDate(booking.created_at, searchQuery)
      );
    });
  }, [bookings, query]);

  return {
    searchTerm,
    searchQuery: query,
    filteredBookings,
    handleSearchChange,
    clearSearch: () => handleSearchChange('')
  };
};
