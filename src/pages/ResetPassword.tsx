import { useState, useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function ResetPassword() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: "", color: "" };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { score: 0, text: "Too weak", color: "text-red-500" },
      { score: 1, text: "Weak", color: "text-red-400" },
      { score: 2, text: "Fair", color: "text-yellow-500" },
      { score: 3, text: "Good", color: "text-yellow-400" },
      { score: 4, text: "Strong", color: "text-green-400" },
      { score: 5, text: "Very strong", color: "text-green-500" }
    ];

    return levels[score] || levels[0];
  };

  const passwordStrength = getPasswordStrength(password);
  const isPasswordValid = passwordStrength.score >= 3;

  useEffect(() => {
    const validateRecoverySession = async () => {
      setIsValidating(true);
      
      try {
        // Check URL parameters for recovery tokens (support both hash and query)
        const hash = window.location.hash;
        const search = window.location.search;
        const getParam = (key: string) => {
          const h = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);
          const q = new URLSearchParams(search.startsWith('?') ? search.substring(1) : search);
          return h.get(key) || q.get(key);
        };

        const accessToken = getParam('access_token');
        const refreshToken = getParam('refresh_token');
        const type = getParam('type');
        
        console.log('Recovery validation - URL params:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type
        });

        // Check if this is a recovery flow
        if (type === 'recovery' && accessToken && refreshToken) {
          console.log('Processing recovery tokens...');
          
          // Set the session with the tokens from URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting recovery session:', error);
            setIsValidToken(false);
          } else if (data.session) {
            console.log('Recovery session established successfully');
            setIsValidToken(true);
          } else {
            console.error('No session returned from setSession');
            setIsValidToken(false);
          }
        } else {
          // Check if user already has an active session (direct access)
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting current session:', error);
            setIsValidToken(false);
          } else if (session) {
            console.log('Existing session found for password reset');
            setIsValidToken(true);
          } else {
            console.log('No valid session or recovery tokens found');
            setIsValidToken(false);
          }
        }
      } catch (error) {
        console.error('Unexpected error during recovery validation:', error);
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateRecoverySession();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast({
        title: "Password Too Weak",
        description: "Please choose a stronger password with at least 8 characters, including uppercase, lowercase, and numbers.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both password fields match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting password update...');
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        
        if (error.message.includes('session_not_found')) {
          toast({
            title: "Session Expired",
            description: "Your reset link has expired. Please request a new one.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }
        
        toast({
          title: "Update Failed",
          description: error.message || "Failed to update password. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Password updated successfully');
      setIsComplete(true);

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated. You can now sign in with your new password.",
      });

      // Sign out the user after successful password reset for security
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/auth');
      }, 3000);

    } catch (error) {
      console.error('Unexpected error during password update:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Do not redirect away; allow password reset even if session is established during recovery

  // Loading state during token validation
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Validating reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invalid or Expired Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Password Updated Successfully</CardTitle>
            <CardDescription>
              Your password has been changed. You will be redirected to sign in shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Continue to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Password</CardTitle>
          <CardDescription>
            Enter your new password below. Make sure it's strong and secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  disabled={isLoading}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {password && (
                <div className="flex items-center gap-2 text-sm">
                  <div className={`flex-1 h-1 rounded-full ${
                    passwordStrength.score >= 3 ? 'bg-green-500' : 
                    passwordStrength.score >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className={passwordStrength.color}>
                    {passwordStrength.text}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-destructive">
                  Passwords do not match
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isPasswordValid || password !== confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}