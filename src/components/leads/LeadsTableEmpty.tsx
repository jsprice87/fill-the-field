
import React from 'react';
import { Phone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeadsTableEmptyProps {
  searchQuery?: string;
  showArchived?: boolean;
}

const LeadsTableEmpty: React.FC<LeadsTableEmptyProps> = ({ searchQuery, showArchived }) => {
  if (searchQuery) {
    return (
      <div className="text-center p-8">
        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="font-agrandir text-xl text-brand-navy mb-2">No results for "{searchQuery}"</h3>
        <p className="font-poppins text-gray-600">
          Try adjusting your search terms or clear the search to see all leads.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center p-8">
      <Phone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="font-agrandir text-xl text-brand-navy mb-2">
        {showArchived ? 'No Archived Leads' : 'No Leads Yet'}
      </h3>
      <p className="font-poppins text-gray-600 mb-6">
        {showArchived 
          ? 'No leads have been archived yet.'
          : 'When users sign up through your landing page, they\'ll appear here.'
        }
      </p>
      {!showArchived && (
        <Button className="bg-brand-blue hover:bg-brand-blue/90 text-white font-poppins">
          Share Your Landing Page
        </Button>
      )}
    </div>
  );
};

export default LeadsTableEmpty;
