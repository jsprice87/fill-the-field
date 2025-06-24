
import { format } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { DEFAULT_TIMEZONE } from './timezoneUtils';

interface CalendarEvent {
  title: string;
  description: string;
  start: Date;
  end: Date;
  location: string;
  timezone?: string;
}

export const generateCalendarUrls = (event: CalendarEvent) => {
  const timezone = event.timezone || DEFAULT_TIMEZONE;
  
  // Convert to the target timezone and format for calendar URLs
  const startInTz = toZonedTime(event.start, timezone);
  const endInTz = toZonedTime(event.end, timezone);
  
  // Format for calendar URLs (no timezone suffix for cross-platform compatibility)
  const startTime = format(startInTz, "yyyyMMdd'T'HHmmss");
  const endTime = format(endInTz, "yyyyMMdd'T'HHmmss");
  
  const encodedTitle = encodeURIComponent(event.title);
  const encodedDescription = encodeURIComponent(event.description);
  const encodedLocation = encodeURIComponent(event.location);

  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${startTime}/${endTime}&details=${encodedDescription}&location=${encodedLocation}&ctz=${timezone}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodedTitle}&startdt=${startTime}&enddt=${endTime}&body=${encodedDescription}&location=${encodedLocation}`,
    ics: generateICSFile(event)
  };
};

const generateICSFile = (event: CalendarEvent) => {
  const timezone = event.timezone || DEFAULT_TIMEZONE;
  
  // Convert to the target timezone
  const startInTz = toZonedTime(event.start, timezone);
  const endInTz = toZonedTime(event.end, timezone);
  const nowInTz = toZonedTime(new Date(), timezone);
  
  // Format for ICS file
  const startTime = format(startInTz, "yyyyMMdd'T'HHmmss");
  const endTime = format(endInTz, "yyyyMMdd'T'HHmmss");
  const now = format(nowInTz, "yyyyMMdd'T'HHmmss");

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Soccer Stars//EN',
    'BEGIN:VTIMEZONE',
    `TZID:${timezone}`,
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${now}@fillthefield.com`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=${timezone}:${startTime}`,
    `DTEND;TZID=${timezone}:${endTime}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
};

export const downloadICSFile = (event: CalendarEvent) => {
  const icsUrl = generateICSFile(event);
  const link = document.createElement('a');
  link.href = icsUrl;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(icsUrl);
};
