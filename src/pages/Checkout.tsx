import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Loader2, CreditCard, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DODO_PRODUCTS: Record<string, Record<string, string>> = {
  basic: { monthly: 'pdt_0NYXDFIglnn4wukqC1Qa2', yearly: 'pdt_0NYXIK26wpbK6kngEpdrT' },
  pro: { monthly: 'pdt_0NYXEA30vMCJgSxp0pcRw', yearly: 'pdt_0NYXIQ6Nqc7tDx0YXn8OY' },
  ultra: { monthly: 'pdt_0NYXI4SnmvbXxxUZAkDH0', yearly: 'pdt_0NYXIWHTsKjeI7gEcRLdR' },
};

const pricing = {
  basic: { monthly: 19, yearly: 99 },
  pro: { monthly: 49, yearly: 299 },
  ultra: { monthly: 99, yearly: 599 },
};

const savingsPercent: Record<string, number> = {
  basic: 57,
  pro: 49,
  ultra: 50,
};

const basicFeatures = [
  'Unlimited Document Generations',
  'All Templates Available',
  'Single Admin Access',
  'Organization Branding',
  'Basic Support',
];

const proFeatures = [
  'Everything in Basic',
  'QR Verification',
  'Request Portal (Up to 100 Members)',
  'Up to 5 Admins',
  'Priority Email Support',
];

const ultraFeatures = [
  'Everything in Pro',
  'Unlimited Admins',
  'Request Portal (Unlimited Members)',
  'Agentic AI Assistant',
  'Custom Document Requests',
];

export default function Checkout() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading, hasActiveSubscription } = useSubscription();
  const { toast } = useToast();

  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'ultra'>('pro');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!subLoading && hasActiveSubscription) {
      navigate('/dashboard', { replace: true });
    }
  }, [subLoading, hasActiveSubscription, navigate]);

  useEffect(() => {
    // Check sessionStorage for plan intent
    const storedPlan = sessionStorage.getItem('selectedPlanIntent');
    if (storedPlan && ['basic', 'pro', 'ultra'].includes(storedPlan)) {
      setSelectedPlan(storedPlan as 'basic' | 'pro' | 'ultra');
    } else if (subscription?.selected_plan) {
      const plan = subscription.selected_plan as 'basic' | 'pro' | 'ultra';
      if (['basic', 'pro', 'ultra'].includes(plan)) {
        setSelectedPlan(plan);
      }
    }
  }, [subscription]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleProceedToPayment = async () => {
    if (!user?.id || !user?.email) {
      toast({ title: 'Error', description: 'You must be logged in to proceed', variant: 'destructive' });
      return;
    }

    setIsRedirecting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No active session');

      const productId = DODO_PRODUCTS[selectedPlan][billingPeriod];

      const response = await supabase.functions.invoke('create-dodo-checkout', {
        body: {
          productId,
          plan: selectedPlan,
          billingPeriod,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout`,
        },
      });

      if (response.error) throw new Error(response.error.message || 'Failed to create checkout');

      const { checkout_url } = response.data;
      if (!checkout_url) throw new Error('No checkout URL returned');

      window.location.href = checkout_url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast({ title: 'Error', description: err.message || 'Failed to initialize checkout. Please try again.', variant: 'destructive' });
      setIsRedirecting(false);
    }
  };

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isYearly = billingPeriod === 'yearly';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/uploads/Certifyr Black Logotype.png" alt="Certifyr Logo" className="mx-auto h-16 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Plan to Continue</h1>
          <p className="text-gray-600">Select the plan that best fits your organization's needs</p>
        </div>

        {/* Billing Toggle — matches onboarding PricingStage */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <span className={cn("text-sm font-medium", !isYearly ? "text-blue-600" : "text-gray-500")}>
            Billed Monthly
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={(checked) => setBillingPeriod(checked ? 'yearly' : 'monthly')}
            className="data-[state=checked]:bg-blue-600"
          />
          <div className="flex items-center space-x-2">
            <span className={cn("text-sm font-medium", isYearly ? "text-blue-600" : "text-gray-500")}>
              Billed Yearly
            </span>
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
              Save up to 57%
            </Badge>
          </div>
        </div>

        {/* Plan Cards — matches onboarding PricingStage layout */}
        <div className="flex flex-row justify-center gap-x-4 mb-8 pt-3">
          {/* Basic Plan */}
          <Card
            className={cn(
              'relative cursor-pointer transition-all duration-300 hover:shadow-xl pt-3 max-w-xs w-full',
              selectedPlan === 'basic'
                ? 'ring-2 ring-blue-600 bg-blue-50/50 backdrop-blur-sm'
                : 'bg-white/70 backdrop-blur-sm hover:bg-white/80'
            )}
            onClick={() => setSelectedPlan('basic')}
          >
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold">Basic</CardTitle>
              <div className="py-4">
                <div className="text-4xl font-bold text-gray-800">${pricing.basic[billingPeriod]}</div>
                <div className="text-gray-500">{isYearly ? 'per year' : 'per month'}</div>
                {isYearly && (
                  <div className="text-sm text-green-600 font-medium">Save {savingsPercent.basic}%</div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={(e) => { e.stopPropagation(); setSelectedPlan('basic'); }}
                variant={selectedPlan === 'basic' ? 'default' : 'outline'}
                className={cn(
                  'w-full mb-6 h-12 transition-all duration-200 hover:scale-105',
                  selectedPlan === 'basic'
                    ? 'bg-[#1b80ff] text-white border border-[#1b80ff]'
                    : 'bg-white text-[#1b80ff] border border-[#1b80ff] hover:bg-[#1b80ff] hover:text-white'
                )}
              >
                {selectedPlan === 'basic' ? 'Selected' : 'Select Basic'}
              </Button>
              <ul className="space-y-3">
                {basicFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card
            className={cn(
              'relative cursor-pointer transition-all duration-300 hover:shadow-xl pt-3 max-w-xs w-full',
              selectedPlan === 'pro'
                ? 'ring-2 ring-[#1b80ff] bg-[#eaf4ff] backdrop-blur-sm'
                : 'bg-white/70 backdrop-blur-sm hover:bg-white/80'
            )}
            onClick={() => setSelectedPlan('pro')}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-[#1b80ff] text-white px-4 py-1">
                <Star className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>
            <CardHeader className="text-center pb-4 pt-8">
              <CardTitle className="text-xl font-semibold">Pro</CardTitle>
              <div className="py-4">
                <div className="text-4xl font-bold text-gray-800">${pricing.pro[billingPeriod]}</div>
                <div className="text-gray-500">{isYearly ? 'per year' : 'per month'}</div>
                {isYearly && (
                  <div className="text-sm text-green-600 font-medium">Save {savingsPercent.pro}%</div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={(e) => { e.stopPropagation(); setSelectedPlan('pro'); }}
                variant={selectedPlan === 'pro' ? 'default' : 'outline'}
                className={cn(
                  'w-full mb-6 h-12 transition-all duration-200 hover:scale-105',
                  selectedPlan === 'pro'
                    ? 'bg-[#1b80ff] text-white border border-[#1b80ff]'
                    : 'bg-white text-[#1b80ff] border border-[#1b80ff] hover:bg-[#1b80ff] hover:text-white'
                )}
              >
                {selectedPlan === 'pro' ? 'Selected' : 'Select Pro'}
              </Button>
              <ul className="space-y-3">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Ultra Plan */}
          <Card
            className={cn(
              'relative cursor-pointer transition-all duration-300 hover:shadow-xl pt-3 max-w-xs w-full',
              selectedPlan === 'ultra'
                ? 'ring-2 ring-purple-600 bg-purple-50/50 backdrop-blur-sm'
                : 'bg-white/70 backdrop-blur-sm hover:bg-white/80'
            )}
            onClick={() => setSelectedPlan('ultra')}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-purple-600 text-white px-4 py-1">Enterprise</Badge>
            </div>
            <CardHeader className="text-center pb-4 pt-8">
              <CardTitle className="text-xl font-semibold">Ultra</CardTitle>
              <div className="py-4">
                <div className="text-4xl font-bold text-gray-800">${pricing.ultra[billingPeriod]}</div>
                <div className="text-gray-500">{isYearly ? 'per year' : 'per month'}</div>
                {isYearly && (
                  <div className="text-sm text-green-600 font-medium">Save {savingsPercent.ultra}%</div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={(e) => { e.stopPropagation(); setSelectedPlan('ultra'); }}
                variant={selectedPlan === 'ultra' ? 'default' : 'outline'}
                className={cn(
                  'w-full mb-6 h-12 transition-all duration-200 hover:scale-105',
                  selectedPlan === 'ultra'
                    ? 'bg-purple-600 text-white border border-purple-600'
                    : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-600 hover:text-white'
                )}
              >
                {selectedPlan === 'ultra' ? 'Selected' : 'Select Ultra'}
              </Button>
              <ul className="space-y-3">
                {ultraFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleProceedToPayment}
            disabled={isRedirecting}
            className="w-full h-12 bg-[#1b80ff] hover:bg-[#1566d4] text-lg font-semibold"
          >
            {isRedirecting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Redirecting to payment...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Proceed to Payment — ${pricing[selectedPlan][billingPeriod]}/{isYearly ? 'year' : 'month'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
