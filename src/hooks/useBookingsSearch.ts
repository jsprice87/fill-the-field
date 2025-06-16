
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

  // Filter bookings based on search query and archive status
  const filteredBookings = useMemo(() => {
    // First filter by archive status
    let filteredByArchive = bookings;
    if (!includeArchived) {
      filteredByArchive = bookings.filter(booking => !booking.archived_at);
    }

    // Then apply search filter
    if (!query.trim()) return filteredByArchive;

    const searchQuery = query.trim();
    
    return filteredByArchive.filter(booking => {
      // Search in all text fields
      return (
        searchInText(booking.parent_first_name, searchQuery) ||
        searchInText(booking.parent_last_name, searchQuery) ||
        searchInText(booking.participants?.[0]?.first_name, searchQuery) ||
        searchInText(booking.class_schedules?.classes?.locations?.name, searchQuery) ||
        searchInText(booking.class_schedules?.classes?.class_name, searchQuery) ||
        searchInText(booking.status, searchQuery) ||
        searchInText(booking.participants?.[0]?.age?.toString(), searchQuery) ||
        searchInDate(booking.selected_date, searchQuery) ||
        searchInDate(booking.created_at, searchQuery)
      );
    });
  }, [bookings, query, includeArchived]);

  return {
    searchTerm,
    searchQuery: query,
    filteredBookings,
    handleSearchChange,
    clearSearch: () => handleSearchChange('')
  };
};
