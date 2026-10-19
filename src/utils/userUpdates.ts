import type { Segment, User } from '../data/mockData';

// The detail page form, as it is when Save is pressed
export interface DetailForm {
  segment: Segment;
  lifetimeValue: number;
  transactionCount: number;
  lastActivityDate: string; // <input type="date"> value, '' when empty
}

// What Save writes, same as the reference. Segment is always saved. The three financial
// values are saved only in edit mode, all together, even the ones nobody changed.
export function buildUserUpdates(form: DetailForm, isEditingFinancials: boolean): Partial<User> {
  const updates: Partial<User> = { segment: form.segment };
  if (isEditingFinancials) {
    updates.lifetimeValueOverride = form.lifetimeValue;
    updates.transactionCountOverride = form.transactionCount;
    // An empty date keeps the previous value. A date-only value is read as UTC midnight,
    // so US time zones then show the day before.
    if (form.lastActivityDate) {
      updates.lastActivityOverride = new Date(form.lastActivityDate).toISOString();
    }
  }
  return updates;
}
