'use client';

import { ComparePage as ComparePageComponent } from '../_components/ComparePage';
import { NavigationBar } from '../_components/NavigationBar';

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <NavigationBar activeTab="compare" onTabChange={() => {}} />
      <div className="flex-1">
        <ComparePageComponent />
      </div>
    </div>
  );
}
