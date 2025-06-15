
import React from 'react';
import { Calendar, Search } from 'lucide-react';

interface BookingsTableEmptyProps {
  searchQuery?: string;
  showArchived?: boolean;
}

const BookingsTableEmpty: React.FC<BookingsTableEmptyProps> = ({ searchQuery, showArchived }) => {
  if (searchQuery) {
    return (
      <div className="text-center p-8">
        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="font-agrandir text-xl text-brand-navy mb-2">No results for "{searchQuery}"</h3>
        <p className="font-poppins text-gray-600">
          Try adjusting your search terms or clear the search to see all bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center p-8">
      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="font-agrandir text-xl text-brand-navy mb-2">
        {showArchived ? 'No Archived Bookings' : 'No Bookings Yet'}
      </h3>
      <p className="font-poppins text-gray-600">
        {showArchived 
          ? 'No bookings have been archived yet.'
          : 'When people book classes through your landing page, they\'ll appear here.'
        }
      </p>
    </div>
  );
};

export default BookingsTableEmpty;
