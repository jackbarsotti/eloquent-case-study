import type { Segment, Transaction, User } from '../data/mockData';

const DAY_MS = 1000 * 60 * 60 * 24;
const CHURN_WINDOW_DAYS = 60;
const HIGH_VALUE_SEGMENTS: Segment[] = ['Enterprise', 'SME'];

export interface UserStats {
  totalSpent: number;
  txCount: number;
  lastActivityISO: string; // '' when the client has no activity
}

export interface KPIs {
  avgCustomerLTV: number; // whole dollars
  enterpriseShare: string; // percent with 1 decimal, e.g. '95.5'
  atRiskCount: number;
}

const sumAmounts = (transactions: Transaction[]) =>
  transactions.reduce((sum, t) => sum + t.amount, 0);

const completedTransactionsOf = (userId: string, transactions: Transaction[]) =>
  transactions.filter((t) => t.userId === userId && t.status === 'completed');

const latestDate = (transactions: Transaction[]) =>
  transactions.reduce(
    (latest, t) => (!latest || new Date(t.date) > new Date(latest) ? t.date : latest),
    '',
  );

// Whole days between the two dates (rounded up, either direction) are at most `days`
export const isWithinLastDays = (dateISO: string, days: number, now: Date) => {
  const diffDays = Math.ceil(Math.abs(now.getTime() - new Date(dateISO).getTime()) / DAY_MS);
  return diffDays <= days;
};

// Values shown for one client. Saved overrides win over computed values.
// Only completed transactions count.
export function computeUserStats(user: User, transactions: Transaction[]): UserStats {
  const completed = completedTransactionsOf(user.id, transactions);
  return {
    totalSpent: user.lifetimeValueOverride ?? sumAmounts(completed),
    txCount: user.transactionCountOverride ?? completed.length,
    lastActivityISO: user.lastActivityOverride || latestDate(completed),
  };
}

export function calculateKPIs(users: User[], transactions: Transaction[], now = new Date()): KPIs {
  // Avg Customer LTV: each client's lifetime value (override first), averaged over all clients
  const totalLTV = users.reduce((sum, user) => sum + computeUserStats(user, transactions).totalSpent, 0);
  const avgCustomerLTV = users.length > 0 ? totalLTV / users.length : 0;

  // Enterprise Revenue: completed revenue of Enterprise clients / all completed revenue.
  // Uses transactions only, so lifetime value overrides and status don't change it.
  const enterpriseIds = new Set(users.filter((u) => u.segment === 'Enterprise').map((u) => u.id));
  const completed = transactions.filter((t) => t.status === 'completed');
  const totalRevenue = sumAmounts(completed);
  const enterpriseRevenue = sumAmounts(completed.filter((t) => enterpriseIds.has(t.userId)));
  const enterpriseShare = totalRevenue > 0 ? (enterpriseRevenue / totalRevenue) * 100 : 0;

  // Churn Risk: active Enterprise/SME clients with no activity in the last 60 days
  const atRiskCount = users.filter((user) => {
    if (user.status !== 'active' || !HIGH_VALUE_SEGMENTS.includes(user.segment)) return false;
    const { lastActivityISO } = computeUserStats(user, transactions);
    return !lastActivityISO || !isWithinLastDays(lastActivityISO, CHURN_WINDOW_DAYS, now);
  }).length;

  return {
    avgCustomerLTV: Math.round(avgCustomerLTV),
    enterpriseShare: enterpriseShare.toFixed(1),
    atRiskCount,
  };
}
