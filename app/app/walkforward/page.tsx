'use client';

import WalkForwardAnalysis from '../_components/WalkForwardAnalysis';
import Navbar from '../_components/Navbar';

export default function WalkForwardPage() {
  return (
    <div className="min-h-screen bg-primary-50 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <WalkForwardAnalysis />
      </div>
    </div>
  );
}
