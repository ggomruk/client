'use client';

import StrategyOptimizer from '../_components/StrategyOptimizer';
import Navbar from '../_components/Navbar';

export default function OptimizerPage() {
  return (
    <div className="min-h-screen bg-primary-50 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <StrategyOptimizer />
      </div>
    </div>
  );
}
