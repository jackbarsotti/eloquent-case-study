import { useEffect } from 'react';
import { useData } from '../context/DataContext';
import { UserTable } from '../components/UserTable';

export function Dashboard() {
  const { users, transactions } = useData();

  useEffect(() => {
    document.title = 'Eloquent Case Study';
  }, []);

  return (
    <div className="space-y-6">
      <header className="mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Eloquent Case Study</h1>
      </header>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Client Entities</h2>
        </div>
        <UserTable users={users} transactions={transactions} />
      </section>
    </div>
  );
}
