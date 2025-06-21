
import { DbClass, DbClassSchedule, DbClassInput, DbClassScheduleInput } from '@/types/db';
import { Class, ClassSchedule } from '@/types/domain';

// Convert database class to domain class
export function toDomainClass(dto: DbClass): Class {
  return {
    id: dto.id,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    locationId: dto.location_id,
    name: dto.name,
    className: dto.class_name,
    description: dto.description,
    durationMinutes: dto.duration_minutes,
    maxCapacity: dto.max_capacity,
    minAge: dto.min_age,
    maxAge: dto.max_age,
    isActive: dto.is_active,
  };
}

// Convert domain class to database input
export function toDtoClass(entity: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>): DbClassInput {
  return {
    name: entity.name,
    class_name: entity.className,
    description: entity.description || undefined,
    duration_minutes: entity.durationMinutes,
    max_capacity: entity.maxCapacity,
    min_age: entity.minAge || undefined,
    max_age: entity.maxAge || undefined,
    location_id: entity.locationId,
    is_active: entity.isActive,
  };
}

// Convert database class schedule to domain class schedule
export function toDomainClassSchedule(dto: DbClassSchedule): ClassSchedule {
  return {
    id: dto.id,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    classId: dto.class_id,
    startTime: dto.start_time,
    endTime: dto.end_time,
    dayOfWeek: dto.day_of_week,
    currentBookings: dto.current_bookings,
    isActive: dto.is_active,
    dateStart: dto.date_start ? new Date(dto.date_start) : null,
    dateEnd: dto.date_end ? new Date(dto.date_end) : null,
    class: {
      ...toDomainClass(dto.classes),
      location: {
        id: dto.classes.locations.id,
        name: dto.classes.locations.name,
        address: dto.classes.locations.address,
        city: dto.classes.locations.city,
        state: dto.classes.locations.state,
        zip: dto.classes.locations.zip,
        phone: dto.classes.locations.phone,
        email: dto.classes.locations.email,
        website: dto.classes.locations.website,
      },
    },
  };
}

// Convert domain class schedule to database input
export function toDtoClassSchedule(entity: {
  classId: string;
  startTime: string;
  endTime: string;
  dateStart: Date | null;
  dateEnd: Date | null;
  dayOfWeek: number;
  currentBookings?: number;
  isActive?: boolean;
}): DbClassScheduleInput {
  return {
    class_id: entity.classId,
    start_time: entity.startTime,
    end_time: entity.endTime,
    date_start: entity.dateStart ? entity.dateStart.toISOString().split('T')[0] : null,
    date_end: entity.dateEnd ? entity.dateEnd.toISOString().split('T')[0] : null,
    day_of_week: entity.dayOfWeek,
    current_bookings: entity.currentBookings || 0,
    is_active: entity.isActive !== false,
  };
}

// Helper function for converting Date to ISO date string
export function toISODate(date: Date | null): string | null {
  return date ? date.toISOString().split('T')[0] : null;
}
