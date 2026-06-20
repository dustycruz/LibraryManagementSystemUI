import { format, parseISO } from 'date-fns';

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try { return format(parseISO(dateStr), 'MMM dd, yyyy'); } catch { return '-'; }
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  try { return format(parseISO(dateStr), 'MMM dd, yyyy h:mm a'); } catch { return '-'; }
};

export const formatCurrency = (amount) =>
  `₱${Number(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export const getStatusBadge = (status) => {
  const map = {
    Borrowed: 'bg-primary',
    Returned: 'bg-success',
    Overdue: 'bg-danger',
    Lost: 'bg-dark',
  };
  return map[status] || 'bg-secondary';
};

export const getAvailabilityBadge = (available) =>
  available > 0 ? 'bg-success' : 'bg-danger';