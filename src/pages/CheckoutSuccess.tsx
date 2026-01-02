import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const { hasActiveSubscription, loading, refetch } = useSubscription();
  const [pollCount, setPollCount] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  // Poll for subscription activation (webhook may take a moment)
  useEffect(() => {
    if (hasActiveSubscription) {
      // Subscription is active, redirect to dashboard after a brief delay
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (pollCount >= 30) {
      // Stop polling after 30 attempts (60 seconds)
      setTimedOut(true);
      return;
    }

    // Poll every 2 seconds
    const pollTimer = setTimeout(() => {
      refetch();
      setPollCount((c) => c + 1);
    }, 2000);

    return () => clearTimeout(pollTimer);
  }, [hasActiveSubscription, pollCount, refetch, navigate]);

  if (timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Processing Your Payment
            </h1>
            <p className="text-gray-600 mb-6">
              Your payment is being processed. This may take a few moments.
              Please refresh or try again shortly.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setTimedOut(false);
                  setPollCount(0);
                  refetch();
                }}
                className="w-full"
              >
                Check Again
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/checkout')}
                className="w-full"
              >
                Return to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasActiveSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              Welcome to Certifyr! Redirecting you to your dashboard...
            </p>
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Activating Your Subscription
          </h1>
          <p className="text-gray-600">
            Please wait while we confirm your payment...
          </p>
          <p className="text-sm text-gray-400 mt-4">
            This usually takes just a few seconds
          </p>
        </div>
      </div>
    </div>
  );
}
