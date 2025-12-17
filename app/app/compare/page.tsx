'use client';

import StrategyComparison from '../_components/StrategyComparison';
import Navbar from '../_components/Navbar';

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-primary-50 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <StrategyComparison />
      </div>
    </div>
  );
}
