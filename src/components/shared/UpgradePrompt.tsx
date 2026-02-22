import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlanType, PLAN_METADATA, FEATURE_DISPLAY_NAMES, PlanFeatureSet } from '@/config/planFeatures';
import { cn } from '@/lib/utils';

interface UpgradePromptProps {
  requiredPlan: PlanType;
  feature?: keyof PlanFeatureSet;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'card' | 'inline' | 'banner' | 'dialog' | 'force';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UpgradePrompt({
  requiredPlan,
  feature,
  title,
  description,
  className,
  variant = 'card',
  open,
  onOpenChange,
}: UpgradePromptProps) {
  const navigate = useNavigate();
  const planMeta = PLAN_METADATA[requiredPlan];
  
  const featureName = feature ? FEATURE_DISPLAY_NAMES[feature] : undefined;
  const displayTitle = title || `Upgrade to ${planMeta.name}`;
  const displayDescription = description || 
    (featureName 
      ? `${featureName} is available on the ${planMeta.name} plan and above.`
      : `Unlock more features with the ${planMeta.name} plan.`);

  const handleUpgrade = () => {
    // Store the desired plan and navigate to checkout
    sessionStorage.setItem('selectedPlanIntent', requiredPlan);
    navigate(`/checkout?plan=${requiredPlan === 'basic' ? 'pro' : requiredPlan}`);
    onOpenChange?.(false);
  };

  const handleClose = () => {
    onOpenChange?.(false);
  };

  if ((variant === 'dialog' || variant === 'force') && open !== undefined) {
    const isForce = variant === 'force';
    return (
      <Dialog open={open} onOpenChange={isForce ? () => {} : onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-500" />
              Document Limit Reached
            </DialogTitle>
            <DialogDescription className="pt-2">
              You've reached your 25 documents per month limit on the Basic plan. 
              Upgrade to Pro for unlimited documents and more features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div 
                className="cursor-pointer rounded-lg border-2 border-[#1b80ff] bg-blue-50 p-4 text-center hover:bg-blue-100 transition-colors"
                onClick={() => {
                  sessionStorage.setItem('selectedPlanIntent', 'pro');
                  navigate('/checkout?plan=pro');
                  onOpenChange?.(false);
                }}
              >
                <div className="font-semibold text-lg">Pro</div>
                <div className="text-sm text-gray-600">$49/month</div>
                <Badge className="mt-2 bg-[#1b80ff] text-white text-xs">Most Popular</Badge>
              </div>
              <div 
                className="cursor-pointer rounded-lg border-2 border-purple-600 bg-purple-50 p-4 text-center hover:bg-purple-100 transition-colors"
                onClick={() => {
                  sessionStorage.setItem('selectedPlanIntent', 'ultra');
                  navigate('/checkout?plan=ultra');
                  onOpenChange?.(false);
                }}
              >
                <div className="font-semibold text-lg">Ultra</div>
                <div className="text-sm text-gray-600">$99/month</div>
              </div>
            </div>
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-[#1b80ff] hover:bg-[#1566d4]"
            >
              Upgrade Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <button
              onClick={() => {
                onOpenChange?.(false);
                if (isForce) {
                  navigate('/dashboard');
                }
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Maybe later
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-3 p-3 rounded-lg bg-muted/50 border', className)}>
        <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground flex-1">{displayDescription}</span>
        <Button size="sm" onClick={handleUpgrade}>
          Upgrade
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={cn(
        'flex items-center justify-between p-4 rounded-lg',
        requiredPlan === 'ultra' 
          ? 'bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-200'
          : 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-200',
        className
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-full',
            requiredPlan === 'ultra' ? 'bg-purple-100' : 'bg-blue-100'
          )}>
            <Sparkles className={cn(
              'h-5 w-5',
              requiredPlan === 'ultra' ? 'text-purple-600' : 'text-blue-600'
            )} />
          </div>
          <div>
            <p className="font-medium">{displayTitle}</p>
            <p className="text-sm text-muted-foreground">{displayDescription}</p>
          </div>
        </div>
        <Button 
          onClick={handleUpgrade}
          className={cn(
            requiredPlan === 'ultra' 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          )}
        >
          Upgrade Now
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className={cn('text-center max-w-md mx-auto', className)}>
      <CardHeader>
        <div className="mx-auto mb-4 p-3 rounded-full bg-muted">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          {displayTitle}
          {planMeta.badge && (
            <Badge variant="secondary" className={cn(
              requiredPlan === 'ultra' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-blue-100 text-blue-700'
            )}>
              {planMeta.badge}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{displayDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleUpgrade} 
          className={cn(
            'w-full',
            requiredPlan === 'ultra' 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          )}
        >
          Upgrade to {planMeta.name}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          {planMeta.tagline}
        </p>
      </CardContent>
    </Card>
  );
}
