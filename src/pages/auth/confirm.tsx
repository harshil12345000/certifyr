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
        console.log('AuthConfirm: Starting token verification');
        console.log('URL search params:', window.location.search);
        console.log('URL hash:', window.location.hash);

        // Try to get parameters from query string first (PKCE flow)
        let tokenHash = searchParams.get('token_hash');
        let type = searchParams.get('type') as 'recovery' | 'signup' | 'email' | 'magiclink' | null;
        const next = searchParams.get('next') || '/dashboard';

        // If not in query params, try hash fragment (implicit flow)
        if (!tokenHash && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const hashType = hashParams.get('type');

          console.log('Hash params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, hashType });

          if (accessToken && hashType === 'recovery') {
            // For recovery via hash (implicit flow), set the session directly
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });

            if (sessionError) {
              console.error('Failed to set recovery session:', sessionError);
              setError('Invalid or expired recovery link');
              setIsVerifying(false);
              return;
            }

            console.log('Recovery session established from hash, redirecting to reset-password');
            navigate('/reset-password', { replace: true });
            return;
          }

          // For other hash-based auth (signup confirmation, etc.)
          if (accessToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });

            if (sessionError) {
              console.error('Failed to set session from hash:', sessionError);
              setError('Invalid or expired link');
              setIsVerifying(false);
              return;
            }

            console.log('Session established from hash, redirecting to:', next);
            navigate(next, { replace: true });
            return;
          }
        }

        // Handle PKCE flow with token_hash
        if (tokenHash && type) {
          console.log('Verifying OTP with token_hash, type:', type);

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

          console.log('OTP verified successfully, type:', type);

          // Redirect based on type
          if (type === 'recovery') {
            navigate('/reset-password', { replace: true });
          } else {
            navigate(next, { replace: true });
          }
          return;
        }

        // Check if we already have a valid session (might have been set by Supabase client automatically)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('Existing session found, checking for recovery flow');
          // Check if this is a password recovery session
          // The session user might have aal1 which indicates recovery
          navigate('/reset-password', { replace: true });
          return;
        }

        // No valid token found in any format
        console.error('No valid token found in URL');
        setError('Invalid confirmation link - missing required parameters');
        setIsVerifying(false);

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