import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Get token_hash and type from query parameters
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type') as 'recovery' | 'signup' | 'email' | null;
        const next = searchParams.get('next') || '/dashboard';

        if (!tokenHash || !type) {
          setError('Invalid confirmation link - missing required parameters');
          setIsVerifying(false);
          return;
        }

        // Clear any existing invalid sessions
        await supabase.auth.signOut();

        // Verify the OTP token
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type,
        });

        if (verifyError) {
          console.error('Token verification error:', verifyError);
          setError(verifyError.message || 'Failed to verify token');
          setIsVerifying(false);
          return;
        }

        if (!data.session) {
          setError('Verification succeeded but no session was created');
          setIsVerifying(false);
          return;
        }

        // Success! Redirect to the intended destination
        if (type === 'recovery') {
          navigate('/reset-password');
        } else {
          navigate(next);
        }
      } catch (err) {
        console.error('Unexpected error during verification:', err);
        setError('An unexpected error occurred');
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Verifying...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">
              Please wait while we verify your link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-gray-700">{error}</p>
              <p className="text-sm text-gray-600">
                The link may have expired or already been used.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate("/auth")}
                className="w-full"
              >
                Back to Login
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
