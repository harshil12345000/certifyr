import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState<number | null>(null);

  const RATE_LIMIT_MINUTES = 5;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isRateLimited = () => {
    if (!lastRequestTime) return false;
    const timeDiff = Date.now() - lastRequestTime;
    return timeDiff < RATE_LIMIT_MINUTES * 60 * 1000;
  };

  const getRemainingTime = () => {
    if (!lastRequestTime) return 0;
    const timeDiff = Date.now() - lastRequestTime;
    const remaining = RATE_LIMIT_MINUTES * 60 * 1000 - timeDiff;
    return Math.max(0, Math.ceil(remaining / 1000 / 60));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (isRateLimited()) {
      const remainingMinutes = getRemainingTime();
      toast({
        title: "Too Many Requests",
        description: `Please wait ${remainingMinutes} minute(s) before requesting another reset link.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Use dynamic URL to work in all environments
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      console.log('Sending reset email with redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error("Password reset error:", error);
        // Don't leak whether email exists - always show neutral message
      }

      // Always show success message regardless of whether email exists
      setIsEmailSent(true);
      setLastRequestTime(Date.now());
      
      toast({
        title: "Reset Link Sent",
        description: "If that email is registered, you'll receive a password reset link shortly.",
      });

    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setIsEmailSent(false);
    setIsLoading(false);
    onClose();
  };

  const handleBackToForm = () => {
    setIsEmailSent(false);
    setEmail("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEmailSent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToForm}
                className="p-1 h-auto"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            Reset Your Password
          </DialogTitle>
          <DialogDescription>
            {isEmailSent
              ? "Check your email for the reset link"
              : "Enter your email address and we'll send you a secure link to reset your password."}
          </DialogDescription>
        </DialogHeader>

        {!isEmailSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isRateLimited()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-6">
              <div className="rounded-full bg-primary/10 p-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <strong>{email}</strong> if it's registered with us.
              </p>
              <p className="text-xs text-muted-foreground">
                The link will expire in 1 hour for security reasons.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again in {RATE_LIMIT_MINUTES} minutes.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};