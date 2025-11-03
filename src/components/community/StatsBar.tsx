import { Users, TrendingUp, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function StatsBar() {
  const stats = [
    {
      label: 'Members',
      value: '2.4K',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Posts this week',
      value: '47',
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      label: 'Likes this week',
      value: '324',
      icon: Heart,
      color: 'text-red-500',
      bg: 'bg-red-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

