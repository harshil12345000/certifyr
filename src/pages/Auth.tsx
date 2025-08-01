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
import { AuthSkeleton } from "@/components/auth/AuthSkeleton";
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";

const Auth = () => {
  const { user, signIn, loading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  if (loading) {
    return <AuthSkeleton />;
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
            <div className="mt-4 space-y-2">
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:underline font-medium"
                  disabled={isLoading}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="text-center text-sm text-gray-500">
                New to Certifyr?{' '}
                <Link to="/auth/signup" className="text-blue-600 hover:underline font-medium">
                  Create an Account
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <ForgotPasswordModal 
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
        />
      </div>
    </div>
  );
};
export default Auth;