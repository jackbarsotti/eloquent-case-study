// All app data lives here: the 15 clients and their generated transactions.

export type Segment = 'Enterprise' | 'SME' | 'Startup' | 'Individual';

export interface User {
  id: string;
  name: string;
  email: string;
  segment: Segment;
  joinDate: string; // ISO date, e.g. '2023-01-15'
  status: 'active' | 'inactive';
  // Set when someone saves the Financial Overview on the detail page
  lifetimeValueOverride?: number;
  transactionCountOverride?: number;
  lastActivityOverride?: string; // ISO date-time
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  date: string; // ISO date-time
  status: 'completed' | 'pending' | 'failed';
  category: 'Subscription' | 'Add-on' | 'Service';
}

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Acme Corp', email: 'contact@acme.com', segment: 'Enterprise', joinDate: '2023-01-15', status: 'active' },
  { id: 'u2', name: 'TechStart Inc', email: 'admin@techstart.io', segment: 'Startup', joinDate: '2023-03-10', status: 'active' },
  { id: 'u3', name: 'John Doe Designs', email: 'john@doe.design', segment: 'Individual', joinDate: '2023-05-22', status: 'active' },
  // Renamed from 'Global Logistics', as a hidden note in the reference asks. Nothing else changed.
  { id: 'u4', name: 'Jack Barsotti', email: 'info@glogistics.com', segment: 'Enterprise', joinDate: '2022-11-05', status: 'active' },
  { id: 'u5', name: 'FastFood Chain', email: 'supply@fastfood.com', segment: 'SME', joinDate: '2023-02-18', status: 'inactive' },
  { id: 'u6', name: 'Crypto Bros', email: 'moon@crypto.com', segment: 'Startup', joinDate: '2023-08-01', status: 'active' },
  { id: 'u7', name: 'Sarah Smith', email: 'sarah@smith.com', segment: 'Individual', joinDate: '2023-09-12', status: 'active' },
  { id: 'u8', name: 'MegaCorp', email: 'it@megacorp.com', segment: 'Enterprise', joinDate: '2021-06-30', status: 'active' },
  { id: 'u10', name: 'DevShop Agency', email: 'team@devshop.co', segment: 'SME', joinDate: '2023-04-20', status: 'active' },
  { id: 'u11', name: 'FinTech Innovations', email: 'contact@fintech-inn.com', segment: 'Startup', joinDate: '2023-07-05', status: 'active' },
  { id: 'u12', name: 'Maria Garcia', email: 'maria@garcia.com', segment: 'Individual', joinDate: '2023-10-01', status: 'active' },
  { id: 'u13', name: 'RetailPro Systems', email: 'sales@retailpro.com', segment: 'Enterprise', joinDate: '2022-03-22', status: 'active' },
  { id: 'u14', name: 'Green Energy Co', email: 'info@greenenergy.com', segment: 'SME', joinDate: '2023-06-15', status: 'active' },
  { id: 'u17', name: 'Healthcare Plus', email: 'admin@healthcareplus.com', segment: 'Enterprise', joinDate: '2022-01-18', status: 'active' },
  { id: 'u23', name: 'RoboTech Startup', email: 'hello@robotech.io', segment: 'Startup', joinDate: '2023-10-14', status: 'active' },
];

// Transactions are generated the same way the reference does it: a seeded random
// generator, so every page load gets the same data. Dates use the same local-time
// math (setDate) as the reference.
const SEED = 42;
const GENERATED_AT = '2026-03-04T12:00:00Z';
// These clients only get transactions 75-105 days before GENERATED_AT
const CHURN_RISK_USER_IDS = ['u5', 'u13', 'u17'];

function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateTransactions(users: User[]): Transaction[] {
  const random = createSeededRandom(SEED);
  const generatedAt = new Date(GENERATED_AT);
  const transactions: Transaction[] = [];

  users.forEach((user) => {
    const count = user.segment === 'Enterprise' ? 15 : user.segment === 'SME' ? 8 : 3;

    for (let i = 0; i < count; i++) {
      // Each transaction draws 4 random numbers in this order: date, amount, status, category
      const daysAgo = CHURN_RISK_USER_IDS.includes(user.id)
        ? 75 + Math.floor(random() * 30)
        : Math.floor(random() * 90);
      const date = new Date(generatedAt);
      date.setDate(date.getDate() - daysAgo);

      transactions.push({
        id: `tx_${user.id}_${i}`,
        userId: user.id,
        amount:
          user.segment === 'Enterprise'
            ? Math.floor(random() * 5000) + 1000
            : Math.floor(random() * 500) + 50,
        date: date.toISOString(),
        status: random() > 0.1 ? 'completed' : 'failed',
        category: random() > 0.7 ? 'Add-on' : 'Subscription',
      });
    }
  });

  return transactions;
}

export const INITIAL_TRANSACTIONS: Transaction[] = generateTransactions(INITIAL_USERS);
