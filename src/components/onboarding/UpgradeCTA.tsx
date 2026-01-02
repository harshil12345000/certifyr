import { useState } from 'react';
import { ArrowUp, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UpgradeCTAProps {
  currentPlan: 'basic' | 'pro';
  onUpgrade: (plan: 'pro') => void;
  className?: string;
}

export function UpgradeCTA({ currentPlan, onUpgrade, className }: UpgradeCTAProps) {
  const [dismissed, setDismissed] = useState(false);

  // Don't show if already on Pro or dismissed
  if (currentPlan === 'pro' || dismissed) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 shadow-lg',
        className
      )}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
            <Star className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium text-sm sm:text-base">
              Upgrade to Pro for QR Verification, Request Portal & more!
            </p>
            <p className="text-xs sm:text-sm text-blue-100 hidden sm:block">
              Get all premium features starting at $20/month
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onUpgrade('pro')}
            size="sm"
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
          >
            <ArrowUp className="w-4 h-4 mr-1" />
            Upgrade
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
