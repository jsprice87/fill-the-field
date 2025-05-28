import React, { useMemo } from 'react';
import { useBookings } from '@/hooks/useBookings';
import { Calendar } from 'lucide-react';
import BookingsTable from '@/components/bookings/BookingsTable';

const Bookings = () => {
  const { data: bookings, isLoading, isError, error } = useBookings('your_franchisee_id');

  const stats = useMemo(() => {
    if (!bookings?.length) {
      return {
        totalBookings: 0,
        upcomingClasses: 0,
        completedClasses: 0,
        canceledClasses: 0
      };
    }

    const totalBookings = bookings.length;
    
    // Count bookings by status using the new enum values
    const upcomingClasses = bookings.filter(booking => 
      booking.status === 'booked_upcoming'
    ).length;
    
    const completedClasses = bookings.filter(booking => 
      booking.status === 'booked_complete'
    ).length;
    
    const canceledClasses = bookings.filter(booking => 
      booking.status === 'canceled'
    ).length;

    return {
      totalBookings,
      upcomingClasses,
      completedClasses,
      canceledClasses
    };
  }, [bookings]);

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="font-agrandir text-xl text-brand-navy mb-2">Loading Bookings...</h3>
        <p className="font-poppins text-gray-600">
          Fetching the latest bookings for your classes.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-8">
        <Calendar className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="font-agrandir text-xl text-brand-navy mb-2">Error Loading Bookings</h3>
        <p className="font-poppins text-gray-600">
          {error instanceof Error ? error.message : 'Failed to load bookings. Please try again.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-agrandir text-md text-brand-navy mb-2">Total Bookings</h4>
          <p className="font-poppins text-2xl font-semibold">{stats.totalBookings}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-agrandir text-md text-brand-navy mb-2">Upcoming Classes</h4>
          <p className="font-poppins text-2xl font-semibold">{stats.upcomingClasses}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-agrandir text-md text-brand-navy mb-2">Completed Classes</h4>
          <p className="font-poppins text-2xl font-semibold">{stats.completedClasses}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-agrandir text-md text-brand-navy mb-2">Canceled Classes</h4>
          <p className="font-poppins text-2xl font-semibold">{stats.canceledClasses}</p>
        </div>
      </div>

      <BookingsTable bookings={bookings || []} />
    </div>
  );
};

export default Bookings;
