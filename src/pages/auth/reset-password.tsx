
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Password validation
  const passwordRequirements = {
    minLength: password.length >= 6,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  useEffect(() => {
    const handlePasswordReset = async () => {
      console.log('Initializing password reset...');
      setLoading(true);
      setError("");

      try {
        // Extract tokens from URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        console.log('URL params:', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken, type });

        if (type === 'recovery' && accessToken && refreshToken) {
          console.log('Setting session with recovery tokens...');
          
          // Set the session
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            throw new Error('Failed to authenticate reset session. Please request a new password reset link.');
          }

          if (data.session && data.user) {
            console.log('Password reset session established successfully');
            setSessionReady(true);
          } else {
            throw new Error('Invalid session data received');
          }
        } else {
          // Check if there's already an active session
          const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
          
          if (getSessionError) {
            console.error('Get session error:', getSessionError);
            throw new Error('Authentication error occurred');
          }

          if (session?.user) {
            console.log('Found existing session for password reset');
            setSessionReady(true);
          } else {
            throw new Error('Invalid or expired reset link. Please request a new password reset.');
          }
        }
      } catch (err: any) {
        console.error('Password reset setup error:', err);
        setError(err.message || 'Failed to authenticate reset session');
        toast({
          title: "Authentication Error",
          description: err.message || 'Failed to authenticate reset session',
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    handlePasswordReset();
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    if (!sessionReady) {
      setError("Authentication session not ready. Please try the reset link again.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      console.log('Updating user password...');
      
      const { data, error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) {
        console.error('Password update error:', error);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('Password updated successfully');
        setSuccess("Password updated successfully! Redirecting to sign in...");
        
        toast({
          title: "Success!",
          description: "Your password has been updated successfully.",
        });

        // Sign out the user after successful password reset
        await supabase.auth.signOut();
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
      }
    } catch (err: any) {
      console.error('Password update failed:', err);
      const errorMessage = err.message || "Failed to update password. Please try again.";
      setError(errorMessage);
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-lg">Authenticating reset session...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state (invalid/expired link)
  if (error && !sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Reset Link Invalid</h2>
              <p className="text-red-600 mb-6">{error}</p>
              <Button onClick={() => navigate("/auth")} className="w-full">
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Password Updated!</h2>
              <p className="text-green-600 mb-6">{success}</p>
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Set a New Password</CardTitle>
            <p className="text-gray-600 mt-2 text-sm">Choose a strong password for your account.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    disabled={submitting}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {password && (
                  <div className="text-xs space-y-1 mt-2">
                    <div className={`flex items-center gap-1 ${passwordRequirements.minLength ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordRequirements.minLength ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      At least 6 characters
                    </div>
                    <div className={`flex items-center gap-1 ${passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordRequirements.hasUpperCase ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      One uppercase letter
                    </div>
                    <div className={`flex items-center gap-1 ${passwordRequirements.hasLowerCase ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordRequirements.hasLowerCase ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      One lowercase letter
                    </div>
                    <div className={`flex items-center gap-1 ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordRequirements.hasNumber ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      One number
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    disabled={submitting}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className={`text-xs flex items-center gap-1 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                    {passwordsMatch ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitting || !isPasswordValid || !passwordsMatch}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>

              {/* Back to Sign In */}
              <div className="text-center mt-4">
                <Button 
                  variant="link" 
                  type="button" 
                  onClick={() => navigate("/auth")}
                  disabled={submitting}
                >
                  Back to Sign In
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
