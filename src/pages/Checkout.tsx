import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, ArrowLeft, CreditCard, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Dodo Payments product IDs — replace with your actual Dodo product IDs
const DODO_PRODUCTS = {
  basic: {
    monthly: 'pdt_0NYXDFIglnn4wukqC1Qa2',
    yearly: 'pdt_0NYXIK26wpbK6kngEpdrT',
  },
  pro: {
    monthly: 'pdt_0NYXEA30vMCJgSxp0pcRw',
    yearly: 'pdt_0NYXIQ6Nqc7tDx0YXn8OY',
  },
  ultra: {
    monthly: 'pdt_0NYXI4SnmvbXxxUZAkDH0',
    yearly: 'pdt_0NYXIWHTsKjeI7gEcRLdR',
  },
};

const pricing = {
  basic: { monthly: 19, yearly: 99 },
  pro: { monthly: 49, yearly: 299 },
  ultra: { monthly: 99, yearly: 599 },
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
  const { subscription, loading: subLoading, hasActiveSubscription, updateSelectedPlan } = useSubscription();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'ultra'>('pro');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const parsePlanFromStorage = (): { plan: 'basic' | 'pro' | 'ultra'; billing: 'monthly' | 'yearly' } | null => {
    const storedPlan = sessionStorage.getItem('selectedPlanIntent');
    if (!storedPlan) return null;
    if (storedPlan === 'basic' || storedPlan === 'pro' || storedPlan === 'ultra') {
      return { plan: storedPlan, billing: 'yearly' };
    }
    return null;
  };

  useEffect(() => {
    if (!subLoading && hasActiveSubscription) {
      navigate('/dashboard', { replace: true });
    }
  }, [subLoading, hasActiveSubscription, navigate]);

  useEffect(() => {
    const storedPlanData = parsePlanFromStorage();
    if (storedPlanData) {
      setSelectedPlan(storedPlanData.plan);
      setBillingPeriod(storedPlanData.billing);
    } else if (subscription?.selected_plan) {
      const plan = subscription.selected_plan as 'basic' | 'pro' | 'ultra';
      if (plan === 'basic' || plan === 'pro' || plan === 'ultra') {
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
      toast({
        title: 'Error',
        description: 'You must be logged in to proceed',
        variant: 'destructive',
      });
      return;
    }

    setIsRedirecting(true);

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const productId = DODO_PRODUCTS[selectedPlan][billingPeriod];

      // Call our edge function to create a Dodo checkout session
      const response = await supabase.functions.invoke('create-dodo-checkout', {
        body: {
          productId,
          plan: selectedPlan,
          billingPeriod,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create checkout');
      }

      const { checkout_url } = response.data;
      if (!checkout_url) {
        throw new Error('No checkout URL returned');
      }

      // Redirect to Dodo Payments checkout
      window.location.href = checkout_url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast({
        title: 'Error',
        description: 'Failed to initialize checkout. Please try again.',
        variant: 'destructive',
      });
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

  const selectedPrice = pricing[selectedPlan][billingPeriod];
  const isYearly = billingPeriod === 'yearly';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/uploads/Certifyr Black Logotype.png" 
            alt="Certifyr Logo" 
            className="mx-auto h-16 mb-4" 
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Complete Your Subscription
          </h1>
          <p className="text-gray-600">
            Choose your plan to unlock full access to Certifyr
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              !isYearly ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
              isYearly ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            )}
          >
            Yearly
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
              Save 17%
            </Badge>
          </button>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Basic Plan */}
          <Card
            className={cn(
              'cursor-pointer transition-all duration-300 hover:shadow-xl',
              selectedPlan === 'basic'
                ? 'ring-2 ring-blue-600 bg-blue-50/50'
                : 'bg-white/70 hover:bg-white/80'
            )}
            onClick={() => setSelectedPlan('basic')}
          >
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold">Basic</CardTitle>
              <div className="py-4">
                <div className="text-4xl font-bold text-gray-800">
                  ${pricing.basic[billingPeriod]}
                </div>
                <div className="text-gray-500">
                  {isYearly ? 'per year' : 'per month'}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {basicFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
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
              'cursor-pointer transition-all duration-300 hover:shadow-xl relative',
              selectedPlan === 'pro'
                ? 'ring-2 ring-blue-600 bg-blue-50/50'
                : 'bg-white/70 hover:bg-white/80'
            )}
            onClick={() => setSelectedPlan('pro')}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-blue-600 text-white px-4 py-1">
                <Star className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>
            <CardHeader className="text-center pb-4 pt-8">
              <CardTitle className="text-xl font-semibold">Pro</CardTitle>
              <div className="py-4">
                <div className="text-4xl font-bold text-gray-800">
                  ${pricing.pro[billingPeriod]}
                </div>
                <div className="text-gray-500">
                  {isYearly ? 'per year' : 'per month'}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
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
              'cursor-pointer transition-all duration-300 hover:shadow-xl relative',
              selectedPlan === 'ultra'
                ? 'ring-2 ring-purple-600 bg-purple-50/50'
                : 'bg-white/70 hover:bg-white/80'
            )}
            onClick={() => setSelectedPlan('ultra')}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-purple-600 text-white px-4 py-1">
                Enterprise
              </Badge>
            </div>
            <CardHeader className="text-center pb-4 pt-8">
              <CardTitle className="text-xl font-semibold">Ultra</CardTitle>
              <div className="py-4">
                <div className="text-4xl font-bold text-gray-800">
                  ${pricing.ultra[billingPeriod]}
                </div>
                <div className="text-gray-500">
                  {isYearly ? 'per year' : 'per month'}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {ultraFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Summary & CTA */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
                </h3>
                <p className="text-gray-600">
                  Billed {isYearly ? 'yearly' : 'monthly'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">
                  ${selectedPrice}
                </div>
                <div className="text-sm text-gray-500">
                  {isYearly ? '/year' : '/month'}
                </div>
              </div>
            </div>

            <Button
              onClick={handleProceedToPayment}
              disabled={isRedirecting}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-semibold"
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Redirecting to payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Payment
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Secure payment powered by Dodo Payments
            </p>
          </CardContent>
        </Card>

        {/* Back link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/auth')}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}
