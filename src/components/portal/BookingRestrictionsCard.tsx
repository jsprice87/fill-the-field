import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { TextInput } from '@/components/ui';
import { Calendar, Clock } from 'lucide-react';
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from '@/hooks/useFranchiseeSettings';

const BookingRestrictionsCard: React.FC = () => {
  const { data: settings } = useFranchiseeSettings();
  const updateSetting = useUpdateFranchiseeSetting();

  const maxBookingDaysAhead = parseInt(settings?.max_booking_days_ahead || '7');

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1 && value <= 365) {
      updateSetting.mutate({
        key: 'max_booking_days_ahead',
        value: value.toString()
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Booking Restrictions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="max-days-ahead" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Maximum Days Ahead for Booking
            </Label>
            <TextInput
              id="max-days-ahead"
              type="number"
              min="1"
              max="365"
              value={maxBookingDaysAhead}
              onChange={handleDaysChange}
              disabled={updateSetting.isPending}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Maximum number of days from today that customers can book classes (1-365 days)
            </p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Customers can book classes up to {maxBookingDaysAhead} days from today</li>
            <li>• Only dates within this range and matching class schedules will be available</li>
            <li>• Class start/end dates and exception dates are always respected</li>
            <li>• Only dates matching the class day of the week are bookable</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingRestrictionsCard;
