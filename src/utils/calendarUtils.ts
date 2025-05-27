
interface CalendarEvent {
  title: string;
  description: string;
  start: Date;
  end: Date;
  location: string;
}

export const generateCalendarUrls = (event: CalendarEvent) => {
  const startTime = event.start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endTime = event.end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const encodedTitle = encodeURIComponent(event.title);
  const encodedDescription = encodeURIComponent(event.description);
  const encodedLocation = encodeURIComponent(event.location);

  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${startTime}/${endTime}&details=${encodedDescription}&location=${encodedLocation}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodedTitle}&startdt=${startTime}&enddt=${endTime}&body=${encodedDescription}&location=${encodedLocation}`,
    ics: generateICSFile(event)
  };
};

const generateICSFile = (event: CalendarEvent) => {
  const startTime = event.start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endTime = event.end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Soccer Stars//EN',
    'BEGIN:VEVENT',
    `UID:${now}@soccerstars.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${startTime}`,
    `DTEND:${endTime}`,
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
