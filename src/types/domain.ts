// Domain types - rich Date objects for business logic
export interface Class {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  locationId: string;
  name: string;
  className: string;
  description: string | null;
  durationMinutes: number;
  maxCapacity: number;
  minAge: number | null;
  maxAge: number | null;
  isActive: boolean;
}

export interface ClassSchedule {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  classId: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number | null;
  currentBookings: number;
  isActive: boolean;
  dateStart: Date | null;
  dateEnd: Date | null;
  class: Class & {
    location: {
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      phone: string | null;
      email: string | null;
      website: string | null;
    };
  };
}

// Form types for UI components
export interface ProgramFormData {
  programName: string;
  locationId: string;
  daysOfWeek: number[];
  startDate: Date | null;
  endDate: Date | null;
  overrideDates: Date[];
}

export interface ClassFormData {
  id: string;
  className: string;
  startTime: string;
  duration: number;
  endTime: string;
  minAgeYears: number;
  minAgeMonths: number;
  maxAgeYears: number;
  maxAgeMonths: number;
  capacity: number;
}
