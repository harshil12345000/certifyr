import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        console.log('[AuthConfirm] Starting token verification');
        console.log('[AuthConfirm] Search:', window.location.search);
        console.log('[AuthConfirm] Hash:', window.location.hash);

        // Get parameters from query string (PKCE flow)
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type') as 'recovery' | 'signup' | 'email' | 'magiclink' | null;
        const code = searchParams.get('code');
        const next = searchParams.get('next') || '/dashboard';
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Handle errors in URL
        if (errorParam) {
          console.error('[AuthConfirm] Error in URL:', errorParam, errorDescription);
          setError(errorDescription || 'Verification failed');
          setIsVerifying(false);
          return;
        }

        // Handle hash fragment (implicit flow)
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const hashType = hashParams.get('type');
          const hashError = hashParams.get('error');
          const hashErrorDesc = hashParams.get('error_description');

          if (hashError) {
            console.error('[AuthConfirm] Hash error:', hashError, hashErrorDesc);
            setError(hashErrorDesc || 'Verification failed');
            setIsVerifying(false);
            return;
          }

          if (accessToken) {
            console.log('[AuthConfirm] Setting session from hash, type:', hashType);
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });

            if (sessionError) {
              console.error('[AuthConfirm] Failed to set session:', sessionError);
              setError('Invalid or expired link');
              setIsVerifying(false);
              return;
            }

            // Redirect based on type
            if (hashType === 'recovery') {
              navigate('/reset-password', { replace: true });
            } else {
              setSuccess(true);
              setTimeout(() => navigate(next, { replace: true }), 1500);
            }
            return;
          }
        }

        // Handle PKCE code exchange
        if (code) {
          console.log('[AuthConfirm] Exchanging PKCE code');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('[AuthConfirm] Code exchange failed:', exchangeError);
            setError('Invalid or expired link');
            setIsVerifying(false);
            return;
          }

          if (data.session) {
            if (type === 'recovery') {
              navigate('/reset-password', { replace: true });
            } else {
              setSuccess(true);
              setTimeout(() => navigate(next, { replace: true }), 1500);
            }
            return;
          }
        }

        // Handle token_hash verification
        if (tokenHash && type) {
          console.log('[AuthConfirm] Verifying token_hash, type:', type);
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type,
          });

          if (verifyError) {
            console.error('[AuthConfirm] Token verification failed:', verifyError);
            setError(verifyError.message || 'Verification failed');
            setIsVerifying(false);
            return;
          }

          if (data.session) {
            if (type === 'recovery') {
              navigate('/reset-password', { replace: true });
            } else {
              setSuccess(true);
              setTimeout(() => navigate(next, { replace: true }), 1500);
            }
            return;
          }
        }

        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('[AuthConfirm] Found existing session');
          setSuccess(true);
          setTimeout(() => navigate(next, { replace: true }), 1500);
          return;
        }

        // No valid token found
        console.error('[AuthConfirm] No valid token found');
        setError('Invalid confirmation link');
        setIsVerifying(false);

      } catch (err) {
        console.error('[AuthConfirm] Unexpected error:', err);
        setError('An unexpected error occurred');
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Verifying...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Please wait while we verify your link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verified!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Redirecting you now...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-foreground">{error}</p>
              <p className="text-sm text-muted-foreground">
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
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
