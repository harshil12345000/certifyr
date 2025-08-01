import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

const ResetPassword = () => {
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
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    score: 0,
  });

  const validatePasswordStrength = (pwd: string) => {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    
    setPasswordStrength({
      ...checks,
      score,
    });
    
    return score >= 4; // Require at least 4 out of 5 criteria
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return "bg-destructive";
    if (passwordStrength.score <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 2) return "Weak";
    if (passwordStrength.score <= 3) return "Medium";
    return "Strong";
  };

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');

      if (type !== 'recovery' || !accessToken || !refreshToken) {
        setIsValidToken(false);
        setIsValidating(false);
        return;
      }

      try {
        // Set the session with the tokens from URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error || !data.session) {
          console.error("Token validation error:", error);
          setIsValidToken(false);
        } else {
          setIsValidToken(true);
        }
      } catch (error) {
        console.error("Unexpected token validation error:", error);
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [searchParams]);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    validatePasswordStrength(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordStrength(password)) {
      toast({
        title: "Password Too Weak",
        description: "Please choose a stronger password meeting the requirements.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both password fields match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error("Password update error:", error);
        toast({
          title: "Update Failed",
          description: error.message || "Failed to update password. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Sign out from all sessions for security
      await supabase.auth.signOut();
      
      setIsComplete(true);
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated. You can now sign in with your new password.",
      });

    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToLogin = () => {
    navigate("/auth");
  };

  const handleStartOver = () => {
    navigate("/auth");
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Validating reset link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-4">
            <img src="/uploads/Certifyr Black Logotype.png" alt="Certifyr Logo" className="mx-auto h-20" />
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Invalid or Expired Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired. Reset links are only valid for 1 hour for security reasons.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Please request a new password reset link to continue.
              </p>
              <Button onClick={handleStartOver} className="w-full">
                Request New Reset Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-4">
            <img src="/uploads/Certifyr Black Logotype.png" alt="Certifyr Logo" className="mx-auto h-20" />
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Password Updated Successfully</CardTitle>
              <CardDescription>
                Your password has been updated. You can now sign in with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    For security, you've been signed out from all devices. Please sign in again.
                  </p>
                </div>
              </div>
              <Button onClick={handleReturnToLogin} className="w-full">
                Return to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <img src="/uploads/Certifyr Black Logotype.png" alt="Certifyr Logo" className="mx-auto h-20" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>
              Choose a strong password for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Password strength: {getPasswordStrengthText()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {passwordStrength.score}/5
                      </span>
                    </div>
                    <Progress 
                      value={(passwordStrength.score / 5) * 100} 
                      className="h-2"
                    />
                    <div className="space-y-1 text-xs">
                      <div className={`flex items-center gap-1 ${passwordStrength.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {passwordStrength.length ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        At least 8 characters
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {passwordStrength.uppercase ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        Uppercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.lowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {passwordStrength.lowercase ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        Lowercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.number ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {passwordStrength.number ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        Number
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.special ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {passwordStrength.special ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        Special character
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
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
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Passwords don't match
                  </p>
                )}
                {confirmPassword && password === confirmPassword && password && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Passwords match
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || passwordStrength.score < 4 || password !== confirmPassword}
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
            
            <div className="mt-4 text-center">
              <Link 
                to="/auth" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;