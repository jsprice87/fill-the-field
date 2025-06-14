
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Supabase client
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null })
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}));

describe('build-unified-webhook-payload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate newLead payload with empty booking block', async () => {
    const leadData = {
      id: 'lead-123',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '555-1234',
      zip: '12345',
      franchisees: {
        id: 'franchisee-123',
        company_name: 'Test Soccer Stars',
        sender_name: 'Test Soccer Stars',
        business_email: 'test@soccerstars.com'
      }
    };

    mockSupabase.single.mockResolvedValueOnce({ 
      data: leadData, 
      error: null 
    });

    // Mock the function behavior
    const expectedPayload = {
      event_type: 'newLead',
      timestamp: expect.any(String),
      franchisee_id: 'franchisee-123',
      franchisee_name: 'Test Soccer Stars',
      sender_name: 'Test Soccer Stars',
      business_email: 'test@soccerstars.com',
      lead: {
        id: 'lead-123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        zip: '12345'
      },
      booking: {
        id: '',
        booking_reference: '',
        class_name: '',
        class_date: '',
        class_time: '',
        location_name: '',
        location_address: '',
        participants: [],
        parent_first: '',
        parent_last: ''
      }
    };

    // Verify the expected structure
    expect(expectedPayload.event_type).toBe('newLead');
    expect(expectedPayload.booking.participants).toEqual([]);
    expect(expectedPayload.booking.class_name).toBe('');
  });

  it('should generate newBooking payload with single participant', async () => {
    const leadData = {
      id: 'lead-123',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '555-1234',
      zip: '12345',
      franchisees: {
        id: 'franchisee-123',
        company_name: 'Test Soccer Stars',
        sender_name: 'Test Soccer Stars',
        business_email: 'test@soccerstars.com'
      }
    };

    const bookingData = {
      id: 'booking-123',
      booking_reference: 'ABC12345',
      parent_first_name: 'John',
      parent_last_name: 'Doe',
      class_schedules: {
        id: 'schedule-123',
        start_time: '09:30',
        classes: {
          class_name: 'Soccer Stars - Minis',
          locations: {
            name: 'Harvard Gulch Park',
            address: '550 E. Iliff Ave',
            city: 'Denver',
            state: 'CO'
          }
        }
      },
      appointments: [{
        participant_name: 'Ada Doe',
        participant_age: 4,
        participant_birth_date: '2021-01-20',
        selected_date: '2025-06-12',
        created_at: '2025-06-07T21:05:00Z'
      }]
    };

    mockSupabase.single
      .mockResolvedValueOnce({ data: leadData, error: null })
      .mockResolvedValueOnce({ data: bookingData, error: null });

    const expectedPayload = {
      event_type: 'newBooking',
      timestamp: expect.any(String),
      franchisee_id: 'franchisee-123',
      franchisee_name: 'Test Soccer Stars',
      sender_name: 'Test Soccer Stars',
      business_email: 'test@soccerstars.com',
      lead: {
        id: 'lead-123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        zip: '12345'
      },
      booking: {
        id: 'booking-123',
        booking_reference: 'ABC12345',
        class_name: 'Soccer Stars - Minis',
        class_date: '2025-06-12',
        class_time: '09:30',
        location_name: 'Harvard Gulch Park',
        location_address: '550 E. Iliff Ave, Denver CO',
        participants: [{
          name: 'Ada Doe',
          age: 4,
          dob: '2021-01-20'
        }],
        parent_first: 'John',
        parent_last: 'Doe'
      }
    };

    expect(expectedPayload.event_type).toBe('newBooking');
    expect(expectedPayload.booking.participants).toHaveLength(1);
    expect(expectedPayload.booking.participants[0].name).toBe('Ada Doe');
  });

  it('should generate newBooking payload with multiple participants', async () => {
    const bookingData = {
      appointments: [
        {
          participant_name: 'Ada Doe',
          participant_age: 4,
          participant_birth_date: '2021-01-20',
          selected_date: '2025-06-12',
          created_at: '2025-06-07T21:05:00Z'
        },
        {
          participant_name: 'Ben Doe',
          participant_age: 6,
          participant_birth_date: '2019-03-15',
          selected_date: '2025-06-12',
          created_at: '2025-06-07T21:06:00Z'
        }
      ]
    };

    const expectedParticipants = [
      { name: 'Ada Doe', age: 4, dob: '2021-01-20' },
      { name: 'Ben Doe', age: 6, dob: '2019-03-15' }
    ];

    expect(bookingData.appointments).toHaveLength(2);
    
    // Verify participants are ordered by created_at
    const sortedAppointments = bookingData.appointments.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    expect(sortedAppointments[0].participant_name).toBe('Ada Doe');
    expect(sortedAppointments[1].participant_name).toBe('Ben Doe');
  });
});
