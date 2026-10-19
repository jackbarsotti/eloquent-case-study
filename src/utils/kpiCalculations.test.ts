import { describe, expect, it } from 'vitest';
import { INITIAL_TRANSACTIONS, INITIAL_USERS, type User } from '../data/mockData';
import { calculateKPIs, computeUserStats, isWithinLastDays } from './kpiCalculations';
import { formatLastActive, formatNumber, formatShortDate, formatStatus, toDateInputValue } from './format';
import { buildUserUpdates, type DetailForm } from './userUpdates';

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

// Our one planned change: a hidden note in the reference asks candidates to put their
// own name on the Global Logistics client and keep everything else the same.
const EXPECTED_TABLE = REFERENCE_TABLE.map((row) =>
  row[0] === 'Global Logistics' ? ['Jack Barsotti', ...row.slice(1)] : row,
);

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

// Same steps as the detail page: fill the form from saved data, change it, press Save
type Edit = [id: string, changes: Partial<DetailForm>, editFinancials: boolean];
const save = (users: User[], [id, changes, editFinancials]: Edit) => {
  const user = users.find((u) => u.id === id)!;
  const stats = computeUserStats(user, INITIAL_TRANSACTIONS);
  const form: DetailForm = {
    segment: user.segment,
    lifetimeValue: stats.totalSpent,
    transactionCount: stats.txCount,
    lastActivityDate: toDateInputValue(stats.lastActivityISO),
    ...changes,
  };
  const updates = buildUserUpdates(form, editFinancials);
  return users.map((u) => (u.id === id ? { ...u, ...updates } : u));
};
const saveAll = (...edits: Edit[]) => edits.reduce(save, INITIAL_USERS);

describe('test setup', () => {
  it('runs in New York time, like the reference readings', () => {
    expect(new Date('2023-01-15T12:00:00Z').getTimezoneOffset()).toBe(300);
  });
});

describe('table matches the reference', () => {
  it('differs from the reference only by the planned rename', () => {
    const changed = EXPECTED_TABLE.flatMap((row, r) =>
      row.flatMap((cell, c) => (cell === REFERENCE_TABLE[r][c] ? [] : [`${r},${c}`])),
    );
    expect(changed).toEqual(['3,0']);
  });

  it.each(INITIAL_USERS.map((user, i) => [user.id, user, EXPECTED_TABLE[i]] as const))(
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

// Read from the reference after saving each edit through the detail page.
// The browser clock was pinned to this time for these readings.
const PINNED_NOW = new Date('2026-10-18T16:00:00Z');

describe('KPIs after edits match the reference', () => {
  it.each<[string, Edit[], number, string, number]>([
    ['u1 lifetime value 100000', [['u1', { lifetimeValue: 100000 }, true]], 21372, '95.5', 7],
    ['u2 segment Enterprise', [['u2', { segment: 'Enterprise' }, false]], 17722, '95.9', 8],
    ['u4 last activity today', [['u4', { lastActivityDate: '2026-10-18' }, true]], 17722, '95.5', 6],
    ['u3 transactions 42', [['u3', { transactionCount: 42 }, true]], 17722, '95.5', 7],
    ['u5 (inactive) last activity today', [['u5', { lastActivityDate: '2026-10-18' }, true]], 17722, '95.5', 7],
    ['u5 (inactive) segment Enterprise', [['u5', { segment: 'Enterprise' }, false]], 17722, '96.2', 7],
    ['u1 segment SME', [['u1', { segment: 'SME' }, false]], 17722, '78.5', 7],
    ['u1 lifetime value cleared (0)', [['u1', { lifetimeValue: 0 }, true]], 14706, '95.5', 7],
    ['u1 lifetime value -500', [['u1', { lifetimeValue: -500 }, true]], 14672, '95.5', 7],
    ['u1 lifetime value 1234.567', [['u1', { lifetimeValue: 1234.567 }, true]], 14788, '95.5', 7],
    ['u1 lifetime value 777', [['u1', { lifetimeValue: 777 }, true]], 14757, '95.5', 7],
    [
      'u1 lifetime value 100000, then u2 segment Enterprise',
      [['u1', { lifetimeValue: 100000 }, true], ['u2', { segment: 'Enterprise' }, false]],
      21372,
      '95.9',
      8,
    ],
  ])('%s', (_name, edits, avgCustomerLTV, enterpriseShare, atRiskCount) => {
    expect(kpisFor(saveAll(...edits), PINNED_NOW)).toEqual({ avgCustomerLTV, enterpriseShare, atRiskCount });
  });

  it('ignores edits made with Edit open and then cancelled', () => {
    // Cancel resets the inputs, so Save only writes the segment
    expect(kpisFor(saveAll(['u1', {}, false]), PINNED_NOW)).toEqual(kpisFor(INITIAL_USERS, PINNED_NOW));
  });
});

describe('60-day boundary matches the reference', () => {
  // u1's last activity set N days before 2026-10-18. Saved as UTC midnight of that day.
  it.each([
    [57, 6],
    [58, 6],
    [59, 6],
    [60, 7],
    [61, 7],
    [62, 7],
  ])('%i days back -> churn %i', (daysBack, churn) => {
    const date = new Date(Date.UTC(2026, 9, 18 - daysBack)).toISOString().slice(0, 10);
    expect(kpisFor(saveAll(['u1', { lastActivityDate: date }, true]), PINNED_NOW).atRiskCount).toBe(churn);
  });
});

describe('table cells after edits match the reference', () => {
  const row = (users: User[], id: string) => tableCells(users.find((u) => u.id === id)!);

  it('saving with Edit open moves Last Active back a day (date saved as UTC midnight)', () => {
    expect(row(saveAll(['u1', { lifetimeValue: 100000 }, true]), 'u1').slice(5)).toEqual(['$100,000', '13', '3/2/2026']);
  });

  it('shows a date picked today as yesterday in New York', () => {
    expect(row(saveAll(['u4', { lastActivityDate: '2026-10-18' }, true]), 'u4')[7]).toBe('10/17/2026');
  });

  it('shows overrides as typed: negative, decimals, fractional counts', () => {
    expect(row(saveAll(['u1', { lifetimeValue: -500 }, true]), 'u1')[5]).toBe('$-500');
    expect(row(saveAll(['u1', { lifetimeValue: 1234.567 }, true]), 'u1')[5]).toBe('$1,234.567');
    expect(row(saveAll(['u3', { transactionCount: 2.5 }, true]), 'u3')[6]).toBe('2.5');
  });

  it('keeps the old date override when the date input is cleared', () => {
    const withDate = saveAll(['u1', { lastActivityDate: '2026-10-01' }, true]);
    const cleared = save(withDate, ['u1', { lastActivityDate: '' }, true]);
    expect(row(cleared, 'u1')[7]).toBe('9/30/2026');
  });

  it('formats numbers with the browser locale (de-DE reading)', () => {
    expect(formatNumber(14788, 'de-DE')).toBe('14.788');
    expect(formatNumber(1234.5, 'de-DE')).toBe('1.234,5');
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
