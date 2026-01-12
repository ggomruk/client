import { LayoutDashboard, DollarSign, Calculator, Database, TrendingUp, BarChart3, History, ChevronRight, Zap } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BarChart3, label: "Strategies" },
  { icon: History, label: "Backtest History" },
  { icon: Calculator, label: "Analytics" },
  { icon: Database, label: "Data API", hasArrow: true },
  { icon: TrendingUp, label: "Live Trading", badge: "BETA" },
];

const watchlistAssets = [
  { name: "Bitcoin", amount: "$42,850.00", icon: "BTC", color: "from-orange-500 to-orange-600" },
  { name: "Ethereum", amount: "$2,286.75", icon: "ETH", color: "from-purple-500 to-purple-600" },
  { name: "Binance Coin", amount: "$312.45", icon: "BNB", color: "from-yellow-500 to-yellow-600" },
  { name: "Solana", amount: "$98.32", icon: "SOL", color: "from-purple-400 to-purple-500" },
];

export function Sidebar() {
  return (
    <div className="w-52 bg-[#18181b] border-r border-[#3f3f46] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#3f3f46]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[#fafafa] font-semibold">Stratyx</div>
            <div className="text-xs text-[#a1a1aa]">Trading Analytics</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-3 space-y-1">
          {navItems.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 ${
                item.active
                  ? "bg-gradient-to-r from-[#7c3aed]/20 to-[#06b6d4]/20 text-[#fafafa] border border-[#7c3aed]/30"
                  : "text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#fafafa]"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white">
                  {item.badge}
                </span>
              )}
              {item.hasArrow && <ChevronRight className="w-3 h-3" />}
            </button>
          ))}
        </nav>

        {/* Watchlist */}
        <div className="mt-6 px-3">
          <div className="text-xs text-[#a1a1aa] mb-3 px-3 font-semibold">Watchlist</div>
          {watchlistAssets.map((asset, index) => (
            <div key={index} className="py-3 border-b border-[#3f3f46] last:border-0 hover:bg-[#27272a]/50 rounded-lg px-2 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 bg-gradient-to-br ${asset.color} rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                  {asset.icon.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[#a1a1aa]">{asset.name}</div>
                  <div className="text-sm text-[#fafafa] font-medium">{asset.amount}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-3 border-t border-[#3f3f46]">
        <div className="glass rounded-lg p-3 relative overflow-hidden hover-glow">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/20 to-[#06b6d4]/20"></div>
          <div className="flex items-start gap-2 relative z-10">
            <Zap className="w-4 h-4 text-[#06b6d4] mt-0.5" />
            <div>
              <div className="text-xs text-[#fafafa] font-medium">Upgrade to Pro</div>
              <div className="text-xs text-[#a1a1aa] mt-0.5">Unlock advanced strategies</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
