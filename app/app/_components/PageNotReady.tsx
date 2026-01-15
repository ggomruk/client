'use client';

import { Construction, Wrench, Clock, ArrowLeft } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

interface PageNotReadyProps {
  title?: string;
  description?: string;
  estimatedTime?: string;
  showBackButton?: boolean;
  features?: string[];
}

export function PageNotReady({
  title = 'Page Under Construction',
  description = 'We\'re working hard to bring you this feature. Please check back soon!',
  estimatedTime,
  showBackButton = true,
  features = [],
}: PageNotReadyProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <Card variant="glass" className="max-w-lg w-full p-8 text-center">
        {/* Animated Icon */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-[#18181b] rounded-full flex items-center justify-center">
            <Construction className="w-10 h-10 text-yellow-500 animate-bounce" />
          </div>
          {/* Orbiting wrench */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
            <Wrench className="w-5 h-5 text-purple-400 absolute -top-1 left-1/2 -translate-x-1/2" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-3">
          {title}
        </h2>

        {/* Description */}
        <p className="text-[#a1a1aa] mb-6">
          {description}
        </p>

        {/* Estimated Time */}
        {estimatedTime && (
          <div className="flex items-center justify-center gap-2 text-sm text-[#8b949e] mb-6">
            <Clock className="w-4 h-4" />
            <span>Estimated: {estimatedTime}</span>
          </div>
        )}

        {/* Upcoming Features */}
        {features.length > 0 && (
          <div className="bg-[#21262d] rounded-lg p-4 mb-6 text-left">
            <h4 className="text-sm font-semibold text-white mb-3">Coming Soon:</h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-[#21262d] rounded-full h-2 mb-6 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"
            style={{ width: '45%' }}
          />
        </div>
        <p className="text-xs text-[#6e7681] mb-6">Development in progress...</p>

        {/* Back Button */}
        {showBackButton && (
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        )}
      </Card>
    </div>
  );
}
