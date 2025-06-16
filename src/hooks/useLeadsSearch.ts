
import { useMemo, useState, useEffect } from 'react';
import { Lead } from '@/types';
import { useSearchQuery, useDebounce, searchInText, searchInDate } from '@/utils/searchUtils';

export const useLeadsSearch = (leads: Lead[], includeArchived: boolean = false) => {
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

  // Filter leads based on search query and archive status
  const filteredLeads = useMemo(() => {
    // First filter by archive status
    let filteredByArchive = leads;
    if (!includeArchived) {
      filteredByArchive = leads.filter(lead => !lead.archived_at);
    }

    // Then apply search filter
    if (!query.trim()) return filteredByArchive;

    const searchQuery = query.trim();
    
    return filteredByArchive.filter(lead => {
      // Search in all text fields
      return (
        searchInText(lead.first_name, searchQuery) ||
        searchInText(lead.last_name, searchQuery) ||
        searchInText(lead.email, searchQuery) ||
        searchInText(lead.phone, searchQuery) ||
        searchInText(lead.zip, searchQuery) ||
        searchInText(lead.status, searchQuery) ||
        searchInText(lead.source, searchQuery) ||
        searchInText(lead.notes, searchQuery) ||
        searchInDate(lead.created_at, searchQuery) ||
        searchInDate(lead.updated_at, searchQuery)
      );
    });
  }, [leads, query, includeArchived]);

  return {
    searchTerm,
    searchQuery: query,
    filteredLeads,
    handleSearchChange,
    clearSearch: () => handleSearchChange('')
  };
};
