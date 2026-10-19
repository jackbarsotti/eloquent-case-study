import { createContext, useContext, useState, type ReactNode } from 'react';
import { INITIAL_TRANSACTIONS, INITIAL_USERS, type Transaction, type User } from '../data/mockData';

// Fake network delay for saves, same as the reference
const SAVE_DELAY_MS = 800;

interface DataContextValue {
  users: User[];
  transactions: Transaction[];
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

// One shared store for every page. It lives in memory, so a refresh resets all edits.
export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  const updateUser = (id: string, updates: Partial<User>) =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...updates } : user)));
        resolve();
      }, SAVE_DELAY_MS);
    });

  return (
    <DataContext.Provider value={{ users, transactions: INITIAL_TRANSACTIONS, updateUser }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
