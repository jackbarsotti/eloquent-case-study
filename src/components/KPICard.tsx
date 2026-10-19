import type { LucideIcon } from 'lucide-react';
import { Card } from './ui/Card';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
}

export function KPICard({ title, value, subtitle, icon: Icon }: KPICardProps) {
  // A leading "$" is shown smaller than the number
  const valueText = String(value);
  const hasCurrency = valueText.startsWith('$');
  const displayValue = hasCurrency ? valueText.slice(1) : valueText;

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-[#F9F6F0] rounded-lg">
          <Icon className="w-5 h-5 text-[#57288F]" />
        </div>
      </div>

      <div className="mt-auto">
        <h3 className="text-xs font-medium text-gray-500 mb-1.5">{title}</h3>
        <div className="flex items-baseline mb-1.5">
          {hasCurrency && <span className="text-lg font-semibold text-[#57288F] mr-0.5">$</span>}
          <span className="text-2xl font-bold text-[#57288F]">{displayValue}</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">{subtitle}</p>
      </div>
    </Card>
  );
}
