import { useMemo } from 'react';
import { AlertCircle, DollarSign, TrendingUp } from 'lucide-react';
import { useData } from '../context/DataContext';
import { calculateKPIs } from '../utils/kpiCalculations';
import { formatNumber } from '../utils/format';
import { KPICard } from './KPICard';

export function Sidebar() {
  const { users, transactions } = useData();
  const kpis = useMemo(() => calculateKPIs(users, transactions), [users, transactions]);

  const cards = [
    {
      title: 'Avg Customer LTV',
      value: `$${formatNumber(kpis.avgCustomerLTV)}`,
      subtitle: 'Average lifetime value per customer',
      icon: DollarSign,
    },
    {
      title: 'Enterprise Revenue',
      value: `${kpis.enterpriseShare}%`,
      subtitle: 'Share of total transaction volume',
      icon: TrendingUp,
    },
    {
      title: 'Churn Risk (High Value)',
      value: kpis.atRiskCount,
      subtitle: 'Enterprise/SME > 60 days',
      icon: AlertCircle,
    },
  ];

  return (
    <>
      {/* Desktop: fixed to the left edge */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[280px] lg:w-[300px] bg-[#F9F6F0] border-r border-gray-200 flex-col z-40">
        <div className="p-5 flex-1 overflow-y-auto">
          <SidebarTitle className="mb-6" />
          <div className="flex flex-col gap-4">
            {cards.map((card) => (
              <KPICard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile: KPI row above the page content */}
      <div className="md:hidden p-4 pb-0">
        <SidebarTitle className="mb-4" />
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {cards.map((card) => (
            <div key={card.title} className="min-w-[260px] snap-start">
              <KPICard {...card} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SidebarTitle({ className }: { className: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="w-8 h-8 bg-[#F9F6F0] rounded-lg flex items-center justify-center mr-3">
        <TrendingUp className="w-4 h-4 text-[#57288F]" />
      </div>
      <h2 className="text-lg font-bold text-gray-900">Key Metrics</h2>
    </div>
  );
}
