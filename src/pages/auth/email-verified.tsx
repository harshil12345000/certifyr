import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function EmailVerified() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Store email verification status
    const email = searchParams.get('email');
    if (email) {
      localStorage.setItem('emailVerified', email);
    }

    // Sign out immediately to prevent auto-login during signup
    const signOutUser = async () => {
      await supabase.auth.signOut();
    };
    signOutUser();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Email Verified!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-gray-700">
                Your email has been successfully verified.
              </p>
              <p className="text-sm text-gray-600">
                Please return to the signup page to complete your registration.
              </p>
            </div>

            <Button
              onClick={() => navigate("/auth/signup")}
              className="w-full"
            >
              Continue Sign Up
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
