import { describe, expect, it } from 'vitest';
import { INITIAL_TRANSACTIONS, INITIAL_USERS, type User } from '../data/mockData';
import { calculateKPIs, computeUserStats, isWithinLastDays } from './kpiCalculations';
import { formatLastActive, formatNumber, formatShortDate, formatStatus } from './format';

// Every expected value below was read from the live reference
// (https://project-eloquentcasestudy.magicpatterns.app/) in New York time, en-US,
// on 2026-10-18. The test run uses the same time zone (see vite.config.ts).
const NOW = new Date('2026-10-18T20:00:00-04:00');

// The reference table, cell for cell:
// name, email, segment, status, start date, total spent, transactions, last active
const REFERENCE_TABLE = [
  ['Acme Corp', 'contact@acme.com', 'Enterprise', 'Active', 'Jan 14, 2023', '$45,248', '13', '3/3/2026'],
  ['TechStart Inc', 'admin@techstart.io', 'Startup', 'Active', 'Mar 9, 2023', '$920', '3', '2/23/2026'],
  ['John Doe Designs', 'john@doe.design', 'Individual', 'Active', 'May 21, 2023', '$783', '3', '2/22/2026'],
  ['Global Logistics', 'info@glogistics.com', 'Enterprise', 'Active', 'Nov 4, 2022', '$48,693', '13', '2/15/2026'],
  ['FastFood Chain', 'supply@fastfood.com', 'SME', 'Inactive', 'Feb 17, 2023', '$1,681', '7', '12/18/2025'],
  ['Crypto Bros', 'moon@crypto.com', 'Startup', 'Active', 'Jul 31, 2023', '$799', '3', '2/26/2026'],
  ['Sarah Smith', 'sarah@smith.com', 'Individual', 'Active', 'Sep 11, 2023', '$1,097', '3', '2/19/2026'],
  ['MegaCorp', 'it@megacorp.com', 'Enterprise', 'Active', 'Jun 29, 2021', '$55,946', '15', '2/12/2026'],
  ['DevShop Agency', 'team@devshop.co', 'SME', 'Active', 'Apr 19, 2023', '$2,193', '7', '2/23/2026'],
  ['FinTech Innovations', 'contact@fintech-inn.com', 'Startup', 'Active', 'Jul 4, 2023', '$842', '3', '2/9/2026'],
  ['Maria Garcia', 'maria@garcia.com', 'Individual', 'Active', 'Sep 30, 2023', '$689', '3', '2/17/2026'],
  ['RetailPro Systems', 'sales@retailpro.com', 'Enterprise', 'Active', 'Mar 21, 2022', '$60,411', '14', '12/18/2025'],
  ['Green Energy Co', 'info@greenenergy.com', 'SME', 'Active', 'Jun 14, 2023', '$1,850', '8', '2/22/2026'],
  ['Healthcare Plus', 'admin@healthcareplus.com', 'Enterprise', 'Active', 'Jan 17, 2022', '$43,694', '13', '12/17/2025'],
  ['RoboTech Startup', 'hello@robotech.io', 'Startup', 'Active', 'Oct 13, 2023', '$987', '3', '2/21/2026'],
];

// The same cells, built from our data and formulas
const tableCells = (user: User) => {
  const stats = computeUserStats(user, INITIAL_TRANSACTIONS);
  return [
    user.name,
    user.email,
    user.segment,
    formatStatus(user.status),
    formatShortDate(user.joinDate),
    `$${formatNumber(stats.totalSpent, 'en-US')}`,
    String(stats.txCount),
    formatLastActive(stats.lastActivityISO, 'en-US'),
  ];
};

const kpisFor = (users: User[], now = NOW) => calculateKPIs(users, INITIAL_TRANSACTIONS, now);

describe('test setup', () => {
  it('runs in New York time, like the reference readings', () => {
    expect(new Date('2023-01-15T12:00:00Z').getTimezoneOffset()).toBe(300);
  });
});

describe('table matches the reference', () => {
  it.each(INITIAL_USERS.map((user, i) => [user.id, user, REFERENCE_TABLE[i]] as const))(
    '%s',
    (_id, user, expected) => {
      expect(tableCells(user)).toEqual(expected);
    },
  );
});

describe('KPIs at baseline', () => {
  it('match the reference: $17,722, 95.5%, 7', () => {
    expect(kpisFor(INITIAL_USERS)).toEqual({ avgCustomerLTV: 17722, enterpriseShare: '95.5', atRiskCount: 7 });
  });
});

describe('Churn Risk follows the clock', () => {
  // Read from the reference with the browser clock set to each date
  it.each([
    ['2026-03-04T12:00:00Z', 2],
    ['2026-04-14T12:00:00Z', 3],
    ['2026-04-20T12:00:00Z', 4],
    ['2026-04-24T03:00:00Z', 5],
    ['2026-05-02T12:00:00Z', 6],
    ['2025-12-01T12:00:00Z', 5], // transactions far in the future also count as inactive
  ])('%s -> %i', (date, count) => {
    expect(kpisFor(INITIAL_USERS, new Date(date))).toEqual({
      avgCustomerLTV: 17722,
      enterpriseShare: '95.5',
      atRiskCount: count,
    });
  });
});

describe('isWithinLastDays', () => {
  const day = 24 * 60 * 60 * 1000;
  const daysBefore = (days: number) => new Date(NOW.getTime() - days * day).toISOString();

  it('counts whole days rounded up', () => {
    expect(isWithinLastDays(daysBefore(60), 60, NOW)).toBe(true);
    expect(isWithinLastDays(daysBefore(60.01), 60, NOW)).toBe(false);
  });

  it('treats future dates the same as past dates', () => {
    expect(isWithinLastDays(new Date(NOW.getTime() + 30 * day).toISOString(), 60, NOW)).toBe(true);
    expect(isWithinLastDays(new Date(NOW.getTime() + 61 * day).toISOString(), 60, NOW)).toBe(false);
  });
});
