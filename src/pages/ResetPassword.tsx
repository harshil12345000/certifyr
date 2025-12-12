import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: "", color: "" };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { score: 0, text: "Too weak", color: "text-destructive" },
      { score: 1, text: "Weak", color: "text-destructive" },
      { score: 2, text: "Fair", color: "text-yellow-500" },
      { score: 3, text: "Good", color: "text-green-500" },
      { score: 4, text: "Strong", color: "text-green-600" },
      { score: 5, text: "Very strong", color: "text-green-600" }
    ];

    return levels[score] || levels[0];
  };

  const passwordStrength = getPasswordStrength(password);
  const isPasswordValid = passwordStrength.score >= 3;

  useEffect(() => {
    const validateToken = async () => {
      setIsValidating(true);
      
      try {
        // Check for existing valid session first
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsValidToken(true);
          setIsValidating(false);
          return;
        }

        // Try hash format (implicit flow: #access_token=...&type=recovery)
        const hash = window.location.hash;
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const hashType = hashParams.get('type');

          if (accessToken && hashType === 'recovery') {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });

            if (!error) {
              setIsValidToken(true);
              setIsValidating(false);
              // Clear hash from URL
              window.history.replaceState(null, '', window.location.pathname);
              return;
            }
          }
        }

        // Try query parameter format (PKCE flow: ?token_hash=...&type=recovery)
        const queryParams = new URLSearchParams(window.location.search);
        const tokenHash = queryParams.get('token_hash');
        const queryType = queryParams.get('type') as 'recovery' | null;

        if (tokenHash && queryType === 'recovery') {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: queryType,
          });

          if (!error && data.session) {
            setIsValidToken(true);
            setIsValidating(false);
            // Clear query params from URL
            window.history.replaceState(null, '', window.location.pathname);
            return;
          }
        }

        // No valid token found
        setIsValidToken(false);
      } catch (error) {
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, []);

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
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        toast({
          title: "Update Failed",
          description: updateError.message || "Failed to update password. Please request a new reset link.",
          variant: "destructive",
        });
        
        if (updateError.message.includes('session') || updateError.message.includes('expired')) {
          setTimeout(() => navigate('/auth'), 3000);
        }
        return;
      }

      setIsComplete(true);
      
      toast({
        title: "Password Reset Complete",
        description: "Your password has been successfully updated.",
      });

      await supabase.auth.signOut();
      setTimeout(() => navigate('/auth'), 2000);

    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Validating your reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-destructive/10 p-3">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-center">Invalid or Expired Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              This password reset link is invalid or has expired.
            </p>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Troubleshooting:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Make sure you clicked the link from your email</li>
                <li>Check that you're using the most recent reset email</li>
                <li>The link expires after 1 hour for security</li>
                <li>Try requesting a new reset link</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline"
              onClick={() => navigate('/auth')} 
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-green-500/10 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-center">Password Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              Your password has been successfully changed. You can now sign in with your new password.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Continue to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {password && (
                <div className="flex items-center gap-2 text-sm">
                  <div className={`flex-1 h-1.5 rounded-full ${
                    passwordStrength.score >= 4 ? 'bg-green-500' : 
                    passwordStrength.score >= 3 ? 'bg-green-400' :
                    passwordStrength.score >= 2 ? 'bg-yellow-500' : 'bg-destructive'
                  }`} />
                  <span className={passwordStrength.color}>{passwordStrength.text}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Use 8+ characters with uppercase, lowercase, and numbers
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-destructive">Passwords do not match</p>
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