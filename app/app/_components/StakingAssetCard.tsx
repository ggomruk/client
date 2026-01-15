import { TrendingUp, ExternalLink } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from "recharts";

interface StakingAssetCardProps {
  name: string;
  subtitle: string;
  percentage: string;
  percentageChange: string;
  isPositive: boolean;
  currentValue: string;
  icon: React.ReactNode;
  iconBg: string;
  chartData: number[];
  chartColor: string;
  label?: string;
}

export function StakingAssetCard({
  name,
  subtitle,
  percentage,
  percentageChange,
  isPositive,
  currentValue,
  icon,
  iconBg,
  chartData,
  chartColor,
  label = "24h Change",
}: StakingAssetCardProps) {
  const data = chartData.map((value, index) => ({ value, index }));

  return (
    <div className="bg-[#18181b] rounded-2xl p-5 border border-[#27272a] hover:border-[#7c3aed]/50 transition-all duration-300 hover:scale-[1.02] group cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${iconBg} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <div>
            <div className="text-xs text-[#a1a1aa]">{subtitle}</div>
            <div className="text-[#fafafa] font-semibold">{name}</div>
          </div>
        </div>
        <button className="text-[#a1a1aa] hover:text-[#06b6d4] transition-colors opacity-0 group-hover:opacity-100">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Percentage */}
      <div className="mb-3">
        <div className="text-xs text-[#a1a1aa] mb-1">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl text-[#fafafa] font-bold">{percentage}</span>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${isPositive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            <TrendingUp className={`w-3 h-3 ${!isPositive && "rotate-180"}`} />
            <span>{percentageChange}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-16 relative">
        <ResponsiveContainer width="100%" height={64} minHeight={64}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${name}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              fill={`url(#gradient-${name})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 right-0 text-xs text-[#a1a1aa] bg-[#18181b]/90 px-2 py-1 rounded-lg backdrop-blur-sm">
          {currentValue}
        </div>
      </div>
    </div>
  );
}
