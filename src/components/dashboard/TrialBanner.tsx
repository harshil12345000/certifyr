import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Clock, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DISMISSED_KEY = 'trial-banner-dismissed';

export function TrialBanner() {
  const navigate = useNavigate();
  const { isTrialing, trialDaysRemaining, activePlan } = useSubscription();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISSED_KEY) === 'true'
  );

  if (!isTrialing || dismissed) return null;

  const planLabel = activePlan === 'ultra' ? 'Ultra' : 'Pro';

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div className="relative flex items-center justify-between gap-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 mb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
          <Sparkles className="h-4 w-4 text-blue-600" />
        </div>
        <div className="text-sm">
          <span className="font-semibold text-blue-900">
            You're on a 7-day {planLabel} trial
          </span>
          <span className="text-blue-700 ml-1">
            — {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} remaining
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => navigate('/checkout')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
        >
          Subscribe Now
        </Button>
        <button
          onClick={handleDismiss}
          className="text-blue-400 hover:text-blue-600 transition-colors"
          aria-label="Dismiss trial banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
