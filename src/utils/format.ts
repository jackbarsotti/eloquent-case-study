// Display formats. Like the reference, these use the browser's locale and time zone
// unless a locale is passed (tests pass 'en-US').

// 45248 -> '45,248'. Pages render the "$" as its own text in front, like the reference,
// because that changes how the browser spaces the characters.
export const formatNumber = (value: number, locale?: string) => value.toLocaleString(locale);

// 'active' -> 'Active'
export const formatStatus = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

// '2026-03-03T12:00:00.000Z' -> '3/3/2026'. No activity -> 'Never'.
export const formatLastActive = (dateISO: string, locale?: string) =>
  dateISO ? new Date(dateISO).toLocaleDateString(locale) : 'Never';

// '2023-01-15' -> '1/14/2023' in US time zones (date-only strings are read as UTC midnight)
export const formatDate = (dateISO: string, locale?: string) =>
  new Date(dateISO).toLocaleDateString(locale);

// '2023-01-15' -> 'Jan 14, 2023' in US time zones
export const formatShortDate = (dateISO: string) =>
  new Date(dateISO).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

// Value for <input type="date">: the UTC calendar day of the date
export const toDateInputValue = (dateISO: string) =>
  dateISO ? new Date(dateISO).toISOString().split('T')[0] : '';
