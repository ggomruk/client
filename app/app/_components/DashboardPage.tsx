import { StakingAssetCard } from "./StakingAssetCard";
import { ActiveStaking } from "./ActiveStaking";

// Mock chart data
const ethereumData = [3200, 3150, 3180, 3220, 3190, 3250, 3300, 3280, 3320, 3350, 3380, 3420, 3450, 3480, 3520];
const bnbData = [420, 410, 425, 430, 435, 445, 455, 460, 470, 475, 480, 485, 495, 500, 510];
const polygonData = [1.2, 1.25, 1.22, 1.18, 1.15, 1.12, 1.1, 1.08, 1.05, 1.02, 0.98, 0.95, 0.92, 0.89, 0.87];

export function DashboardPage() {
  return (
    <div className="flex-1 bg-[#09090b] overflow-y-auto">
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8 animate-fadeIn">
          <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">Trading Dashboard</h1>
          <p className="text-sm md:text-base text-[#a1a1aa]">Monitor your strategies and backtest performance</p>
        </div>

        {/* Top Trading Pairs */}
        <div className="mb-6 md:mb-8 animate-slideIn">
          <h2 className="text-lg md:text-xl font-bold text-[#fafafa] mb-4">Top Trading Pairs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <StakingAssetCard
              name="Ethereum (ETH)"
              subtitle="ETH/USDT"
              percentage="13.62%"
              percentageChange="4.95%"
              isPositive={true}
              currentValue="$2,766"
              icon={<span className="text-purple-900 font-bold text-lg">◆</span>}
              iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
              chartData={ethereumData}
              chartColor="#7c3aed"
            />
            <StakingAssetCard
              name="BNB Chain"
              subtitle="BNB/USDT"
              percentage="12.72%"
              percentageChange="5.67%"
              isPositive={true}
              currentValue="$2,090"
              icon={<span className="text-yellow-900 font-bold text-lg">◆</span>}
              iconBg="bg-gradient-to-br from-yellow-500 to-yellow-600"
              chartData={bnbData}
              chartColor="#06b6d4"
            />
            <StakingAssetCard
              name="Polygon (Matic)"
              subtitle="MATIC/USDT"
              percentage="6.29%"
              percentageChange="1.98%"
              isPositive={false}
              currentValue="$0.987"
              icon={<span className="text-purple-900 font-bold text-lg">◆</span>}
              iconBg="bg-gradient-to-br from-purple-400 to-purple-500"
              chartData={polygonData}
              chartColor="#8b5cf6"
            />
          </div>
        </div>

        {/* Active Strategy Section */}
        <ActiveStaking />
      </div>
    </div>
  );
}