
import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const { user, signIn, loading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotError, setForgotError] = useState("");

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signIn(signInEmail, signInPassword, rememberMe);
      if (error) {
        let errorMessage = "An error occurred during sign in";
        if (error.message?.includes("Invalid login credentials")) {
          errorMessage =
            "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message?.includes("Email not confirmed")) {
          errorMessage =
            "Please check your email and click the confirmation link before signing in.";
        } else if (error.message) {
          errorMessage = error.message;
        }
        toast({
          title: "Sign In Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in.",
        });
      }
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotSuccess("");
    setForgotError("");
    
    try {
      // Use the current window location to construct the redirect URL
      const resetUrl = `${window.location.origin}/auth/reset-password`;
      console.log('Sending password reset email with redirect URL:', resetUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: resetUrl,
      });
      
      if (error) {
        console.error('Password reset error:', error);
        setForgotError(error.message);
      } else {
        setForgotSuccess("Password reset email sent! Please check your inbox and follow the link to reset your password.");
        setForgotEmail("");
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setForgotError("An unexpected error occurred. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <img src="/uploads/Certifyr Black Logotype.png" alt="Certifyr Logo" className="mx-auto h-20" />
          <p className="text-gray-600 mt-0">
            Simplifying Official Documentation
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checkedState) =>
                    setRememberMe(checkedState === true)
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="remember-me" className="text-sm">
                  Remember Me
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-500">
              New to Certifyr?{' '}
              <Link to="/auth/signup" className="text-blue-600 hover:underline font-medium">
                Create an Account
              </Link>
              <div className="mt-2">
                <button
                  type="button"
                  className="text-blue-600 hover:underline font-medium focus:outline-none"
                  onClick={() => setForgotOpen(true)}
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Forgot Password Modal */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <Label htmlFor="forgot-email">Email Address</Label>
            <Input
              id="forgot-email"
              type="email"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoFocus
            />
            {forgotError && <div className="text-red-500 text-sm">{forgotError}</div>}
            {forgotSuccess && <div className="text-green-600 text-sm">{forgotSuccess}</div>}
            <DialogFooter>
              <Button type="submit" disabled={forgotLoading} className="w-full">
                {forgotLoading ? "Sending..." : "Send Reset Email"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
