import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function CheckEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState<string>("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    // Get email from navigation state or redirect to auth
    const stateEmail = location.state?.email;
    if (!stateEmail) {
      navigate("/auth");
      return;
    }
    setEmail(stateEmail);
  }, [location.state, navigate]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (cooldown > 0) return;

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Email Sent!",
        description: "Verification email has been resent. Please check your inbox.",
      });

      setCooldown(60); // 60 second cooldown
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend email",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-gray-700">
                We've sent a verification email to:
              </p>
              <p className="font-semibold text-lg text-gray-900">{email}</p>
              <p className="text-sm text-gray-600 pt-4">
                Please check your inbox and click the verification link to activate your account.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full"
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `Resend Email (${cooldown}s)` : "Resend Verification Email"}
              </Button>

              <Button
                onClick={() => navigate("/auth")}
                variant="ghost"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500 pt-4 border-t">
              <p>Didn't receive the email?</p>
              <p>Check your spam folder or try resending.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
