import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlanType, PLAN_METADATA, FEATURE_DISPLAY_NAMES, PlanFeatureSet } from '@/config/planFeatures';
import { cn } from '@/lib/utils';

interface UpgradePromptProps {
  requiredPlan: PlanType;
  feature?: keyof PlanFeatureSet;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'card' | 'inline' | 'banner';
}

export function UpgradePrompt({
  requiredPlan,
  feature,
  title,
  description,
  className,
  variant = 'card',
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
    navigate('/checkout');
  };

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
