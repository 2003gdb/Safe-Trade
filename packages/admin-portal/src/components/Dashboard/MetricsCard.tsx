'use client';

interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'gray' | 'teal';
}

export default function MetricsCard({ title, value, icon, color = 'blue' }: MetricsCardProps) {
  const colorClasses = {
    blue: 'bg-safetrade-blue/10 text-safetrade-dark border-safetrade-blue/30',
    green: 'bg-status-accepted/10 text-safetrade-dark border-status-accepted/30',
    yellow: 'bg-status-progress/10 text-safetrade-dark border-status-progress/30',
    red: 'bg-status-rejected/10 text-safetrade-dark border-status-rejected/30',
    purple: 'bg-purple-50 text-safetrade-dark border-purple-200',
    indigo: 'bg-indigo-50 text-safetrade-dark border-indigo-200',
    gray: 'bg-gray-50 text-safetrade-dark border-gray-200',
    teal: 'bg-teal-50 text-safetrade-dark border-teal-200',
  };

  const iconColorClasses = {
    blue: 'text-safetrade-blue',
    green: 'text-status-accepted',
    yellow: 'text-status-progress',
    red: 'text-status-rejected',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600',
    gray: 'text-gray-600',
    teal: 'text-teal-600',
  };

  return (
    <div className={`bg-white/70 backdrop-blur-sm overflow-hidden shadow border ${colorClasses[color]}`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`h-8 w-8 ${iconColorClasses[color]}`}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-safetrade-dark/70 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-safetrade-dark">
                {value}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}