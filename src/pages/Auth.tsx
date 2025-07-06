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
import { useAuth, SignUpData } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const organizationTypes = [
  "Corporate",
  "Startup",
  "College",
  "School",
  "Other",
];
const organizationSizes = [
  "1-10",
  "10-50",
  "50-100",
  "100-1000",
  "1000-10000",
  "10000+",
];
const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "India",
  "Australia",
];

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up Form State
  const [signUpFullName, setSignUpFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPhoneNumber, setSignUpPhoneNumber] = useState("");
  const [signUpOrganizationName, setSignUpOrganizationName] = useState("");
  const [signUpOrganizationType, setSignUpOrganizationType] = useState("");
  const [signUpOrganizationTypeOther, setSignUpOrganizationTypeOther] =
    useState("");
  const [signUpOrganizationSize, setSignUpOrganizationSize] = useState("");
  const [signUpOrganizationWebsite, setSignUpOrganizationWebsite] =
    useState("");
  const [signUpOrganizationLocation, setSignUpOrganizationLocation] =
    useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Redirect if already authenticated
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (signUpPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }
    if (signUpPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    if (!signUpFullName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }
    if (
      signUpOrganizationType === "Other" &&
      !signUpOrganizationTypeOther.trim()
    ) {
      toast({
        title: "Organization Type Required",
        description:
          "Please specify your organization type if 'Other' is selected.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const signUpData: SignUpData = {
      fullName: signUpFullName,
      phoneNumber: signUpPhoneNumber,
      organizationName: signUpOrganizationName,
      organizationType: signUpOrganizationType,
      organizationTypeOther:
        signUpOrganizationType === "Other"
          ? signUpOrganizationTypeOther
          : undefined,
      organizationSize: signUpOrganizationSize,
      organizationWebsite: signUpOrganizationWebsite,
      organizationLocation: signUpOrganizationLocation,
    };

    console.log("Submitting signup with data:", signUpData);

    try {
      const { error } = await signUp(signUpEmail, signUpPassword, signUpData);

      if (error) {
        console.error("Signup error received:", error);
        let errorMessage = "An error occurred during sign up";

        if (
          error.message?.includes("User already registered") ||
          error.message?.includes("already registered")
        ) {
          errorMessage =
            "An account with this email already exists. Please sign in instead.";
        } else if (
          error.message?.includes("Password should be at least 6 characters")
        ) {
          errorMessage = "Password must be at least 6 characters long.";
        } else if (error.message?.includes("Invalid email")) {
          errorMessage = "Please enter a valid email address.";
        } else if (error.message?.includes("Database error")) {
          errorMessage =
            "A database error occurred while creating your account. Please try again or contact support.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast({
          title: "Sign Up Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created!",
          description:
            "Please check your email for a confirmation link to complete your registration.",
        });

        // Clear form
        setSignUpFullName("");
        setSignUpEmail("");
        setSignUpPhoneNumber("");
        setSignUpOrganizationName("");
        setSignUpOrganizationType("");
        setSignUpOrganizationTypeOther("");
        setSignUpOrganizationSize("");
        setSignUpOrganizationWebsite("");
        setSignUpOrganizationLocation("");
        setSignUpPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Unexpected signup error:", error);
      toast({
        title: "Sign Up Failed",
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
            <div className="mt-4 text-center text-sm text-gray-500">
              New to Certifyr?{' '}
              <Link to="/auth/signup" className="text-blue-600 hover:underline font-medium">
                Create an Account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default Auth;
