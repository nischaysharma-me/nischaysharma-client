import { format } from 'date-fns';

/**
 * Combines class names into a single string.
 */
export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formats a date string or object into a human-readable format.
 */
export function formatDate(date: string | Date | number, formatStr: string = 'MMM dd, yyyy') {
  if (!date) return '';
  return format(new Date(date), formatStr);
}

/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats a status string for display.
 */
export function formatStatus(status: string) {
  if (!status) return '';
  return capitalize(status.toLowerCase());
}

/**
 * Truncates a string to a specific length.
 */
export function truncate(str: string, length: number) {
  if (!str || str.length <= length) return str;
  return str.slice(0, length) + '...';
}
