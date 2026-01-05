import { TrendingUp, ExternalLink } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

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
    <div className="glass rounded-xl p-4 hover-glow transition-all duration-300 hover:scale-[1.02] animate-slideIn">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${iconBg} w-10 h-10 rounded-lg flex items-center justify-center shadow-lg`}>
            {icon}
          </div>
          <div>
            <div className="text-xs text-[#a1a1aa]">{subtitle}</div>
            <div className="text-[#fafafa] font-semibold">{name}</div>
          </div>
        </div>
        <button className="text-[#a1a1aa] hover:text-[#06b6d4] transition-colors">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Percentage */}
      <div className="mb-3">
        <div className="text-xs text-[#a1a1aa] mb-1">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl text-[#fafafa] font-bold">{percentage}</span>
          <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
            <TrendingUp className={`w-3 h-3 ${!isPositive && "rotate-180"}`} />
            <span>{percentageChange}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-20 relative">
        <ResponsiveContainer width="100%" height={80} minHeight={80}>
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 right-0 text-xs text-[#a1a1aa] bg-[#18181b] px-1.5 py-0.5 rounded">
          {currentValue}
        </div>
      </div>
    </div>
  );
}
