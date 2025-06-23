
import type { Lead } from '@/types';

export const exportLeadsToCsv = (leads: Lead[]) => {
  if (leads.length === 0) {
    return;
  }

  // Define CSV headers
  const headers = [
    'Lead ID',
    'First Name', 
    'Last Name',
    'Email',
    'Phone',
    'Source',
    'Created At',
    'Status'
  ];

  // Convert leads to CSV rows
  const rows = leads.map(lead => [
    lead.id,
    lead.first_name,
    lead.last_name,
    lead.email,
    lead.phone,
    lead.source || '',
    lead.created_at,
    lead.status
  ]);

  // Build CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
