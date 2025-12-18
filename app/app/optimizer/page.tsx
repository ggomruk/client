'use client';

import { OptimizerPage as OptimizerPageComponent } from '../_components/OptimizerPage';
import { NavigationBar } from '../_components/NavigationBar';

export default function OptimizerPage() {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <NavigationBar activeTab="optimizer" onTabChange={() => {}} />
      <div className="flex-1">
        <OptimizerPageComponent />
      </div>
    </div>
  );
}
