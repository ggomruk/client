'use client';

import { WalkForwardPage as WalkForwardPageComponent } from '../_components/WalkForwardPage';
import { NavigationBar } from '../_components/NavigationBar';

export default function WalkForwardPage() {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <NavigationBar activeTab="walkforward" onTabChange={() => {}} />
      <div className="flex-1">
        <WalkForwardPageComponent />
      </div>
    </div>
  );
}
