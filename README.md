
# Soccer Stars Management Platform

A comprehensive management platform for Soccer Stars franchisees to manage leads, bookings, classes, and locations.

## Features

- **Lead Management**: Track and manage potential customers
- **Booking System**: Handle class bookings and appointments
- **Class Scheduling**: Manage class schedules and capacity
- **Location Management**: Organize multiple facility locations
- **Unified Webhook System**: Real-time notifications for leads and bookings

## Webhook System

The platform includes a unified webhook system that sends real-time notifications to external systems (like n8n workflows) when new leads are created or bookings are completed.

### Webhook Events

The system sends two types of events:

1. **newLead**: Triggered when a lead is created (no booking yet)
2. **newBooking**: Triggered when a booking is completed

### Webhook Payload Schema

```json
{
  "event_type": "newLead" | "newBooking",
  "timestamp": "2025-06-07T21:05:00Z",
  "franchisee_id": "uuid",
  "franchisee_name": "South Denver Soccer Stars",
  "sender_name": "South Denver Soccer Stars",
  "business_email": "southdenver@soccerstars.com",
  "lead": {
    "id": "uuid",
    "first_name": "Cortney",
    "last_name": "Price",
    "email": "test@example.com",
    "phone": "303-123-4567",
    "zip": "80110"
  },
  "booking": {
    "id": "uuid",
    "booking_reference": "ABC12345",
    "class_name": "Soccer Stars – Minis",
    "class_date": "2025-06-12",
    "class_time": "09:30",
    "location_name": "Harvard Gulch Park",
    "location_address": "550 E. Iliff Ave, Denver CO",
    "participants": [
      { "name": "Ada Price", "age": 4, "dob": "2021-01-20" }
    ],
    "parent_first": "Cortney",
    "parent_last": "Price"
  }
}
```

**Note**: For `newLead` events, the booking block contains empty strings and arrays since no booking exists yet.

### Webhook QA Testing

#### Test newLead Event
```bash
curl -X POST https://your-n8n-webhook-endpoint.com/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "event_type": "newLead",
    "timestamp": "2025-06-07T21:05:00Z",
    "franchisee_id": "test-franchisee-id",
    "franchisee_name": "Test Soccer Stars",
    "sender_name": "Test Soccer Stars",
    "business_email": "test@soccerstars.com",
    "lead": {
      "id": "test-lead-id",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "555-1234",
      "zip": "12345"
    },
    "booking": {
      "id": "",
      "booking_reference": "",
      "class_name": "",
      "class_date": "",
      "class_time": "",
      "location_name": "",
      "location_address": "",
      "participants": [],
      "parent_first": "",
      "parent_last": ""
    }
  }'
```

#### Test newBooking Event
```bash
curl -X POST https://your-n8n-webhook-endpoint.com/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "event_type": "newBooking",
    "timestamp": "2025-06-07T21:05:00Z",
    "franchisee_id": "test-franchisee-id",
    "franchisee_name": "Test Soccer Stars",
    "sender_name": "Test Soccer Stars",
    "business_email": "test@soccerstars.com",
    "lead": {
      "id": "test-lead-id",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "555-1234",
      "zip": "12345"
    },
    "booking": {
      "id": "test-booking-id",
      "booking_reference": "ABC12345",
      "class_name": "Soccer Stars - Minis",
      "class_date": "2025-06-12",
      "class_time": "09:30",
      "location_name": "Harvard Gulch Park",
      "location_address": "550 E. Iliff Ave, Denver CO",
      "participants": [
        { "name": "Ada Doe", "age": 4, "dob": "2021-01-20" }
      ],
      "parent_first": "John",
      "parent_last": "Doe"
    }
  }'
```

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `MAPBOX_PUBLIC_TOKEN`: Your Mapbox public token
- `WEBHOOK_URL`: Your webhook endpoint URL (for n8n or other integrations)

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Start development server: `npm run dev`

## Deployment

The application is deployed automatically when changes are pushed to the main branch.

<!-- Trigger commit refresh -->
