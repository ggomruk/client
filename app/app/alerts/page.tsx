'use client';

import PriceAlerts from '../_components/PriceAlerts';
import Navbar from '../_components/Navbar';

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-primary-50 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PriceAlerts />
      </div>
    </div>
  );
}
