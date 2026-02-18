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
import { Loader2, Mail, ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "email" | "otp" | "new-password" | "success";

export const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState<number | null>(null);

  const RATE_LIMIT_SECONDS = 60;

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isRateLimited = () => {
    if (!lastRequestTime) return false;
    return Date.now() - lastRequestTime < RATE_LIMIT_SECONDS * 1000;
  };

  const getRemainingTime = () => {
    if (!lastRequestTime) return 0;
    return Math.max(0, Math.ceil((RATE_LIMIT_SECONDS * 1000 - (Date.now() - lastRequestTime)) / 1000));
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { score: 0, text: "Too weak", color: "text-destructive" },
      { score: 1, text: "Weak", color: "text-destructive" },
      { score: 2, text: "Fair", color: "text-yellow-500" },
      { score: 3, text: "Good", color: "text-green-500" },
      { score: 4, text: "Strong", color: "text-green-600" },
      { score: 5, text: "Very strong", color: "text-green-600" },
    ];
    return levels[score] || levels[0];
  };

  const passwordStrength = getPasswordStrength(password);
  const isPasswordValid = passwordStrength.score >= 3;

  // Step 1: Send OTP email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!validateEmail(trimmedEmail)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    if (isRateLimited()) {
      toast({ title: "Too Many Requests", description: `Please wait ${getRemainingTime()} second(s).`, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      // Use resetPasswordForEmail — Supabase will send an OTP code to the email
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);

      if (error) {
        if (error.message.includes("rate") || error.message.includes("limit")) {
          toast({ title: "Too Many Requests", description: "Please wait before requesting another code.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
      }

      // Always advance for security (don't reveal if email exists)
      setLastRequestTime(Date.now());
      setStep("otp");
      toast({ title: "OTP Sent", description: "If that email is registered, you'll receive a 6-digit code shortly." });
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast({ title: "Invalid Code", description: "Please enter the 6-digit code.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp,
        type: "recovery",
      });

      if (error) {
        console.error("[ForgotPassword] OTP verification failed:", error);
        toast({ title: "Invalid Code", description: "The code is incorrect or has expired. Please try again.", variant: "destructive" });
        setOtp("");
        setIsLoading(false);
        return;
      }

      // OTP verified — session is now active, move to password step
      setStep("new-password");
      toast({ title: "Verified", description: "Enter your new password." });
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Update password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast({ title: "Password Too Weak", description: "Use 8+ characters with uppercase, lowercase, and numbers.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Passwords Don't Match", description: "Please make sure both password fields match.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error("[ForgotPassword] Password update failed:", error);
        toast({ title: "Update Failed", description: error.message || "Failed to update password.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      // Sign out so user logs in fresh with new password
      await supabase.auth.signOut();
      setStep("success");
      toast({ title: "Password Updated", description: "You can now sign in with your new password." });
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setStep("email");
    setIsLoading(false);
    onClose();
  };

  const handleBack = () => {
    if (step === "otp") {
      setOtp("");
      setStep("email");
    } else if (step === "new-password") {
      // Can't go back from password step (session is already established)
    }
  };

  const stepDescriptions: Record<Step, string> = {
    email: "Enter your email and we'll send you a 6-digit verification code.",
    otp: `We sent a code to ${email}. Enter it below.`,
    "new-password": "Create a new password for your account.",
    success: "Your password has been updated successfully.",
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "otp" && (
              <Button variant="ghost" size="sm" onClick={handleBack} className="p-1 h-auto">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {step === "email" && "Reset Your Password"}
            {step === "otp" && "Enter Verification Code"}
            {step === "new-password" && "Create New Password"}
            {step === "success" && "Password Updated"}
          </DialogTitle>
          <DialogDescription>{stepDescriptions[step]}</DialogDescription>
        </DialogHeader>

        {/* Step 1: Email */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoFocus
                  className="flex-1"
                />
              </div>
            </div>
            <DialogFooter className="flex-row gap-2 sm:justify-between">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isRateLimited()}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                ) : (
                  <><Mail className="mr-2 h-4 w-4" />Send OTP</>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="flex flex-col items-center space-y-4 py-2">
              <div className="rounded-full bg-primary/10 p-3">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <p className="text-xs text-muted-foreground">
                Didn't receive the code? Check your spam folder or{" "}
                <button
                  type="button"
                  className="underline text-primary hover:text-primary/80"
                  onClick={handleSendOtp as any}
                  disabled={isLoading || isRateLimited()}
                >
                  resend{isRateLimited() ? ` (${getRemainingTime()}s)` : ""}
                </button>
              </p>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</>
                ) : (
                  "Verify Code"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === "new-password" && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
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
                    passwordStrength.score >= 4 ? "bg-green-500" :
                    passwordStrength.score >= 3 ? "bg-green-400" :
                    passwordStrength.score >= 2 ? "bg-yellow-500" : "bg-destructive"
                  }`} />
                  <span className={passwordStrength.color}>{passwordStrength.text}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Use 8+ characters with uppercase, lowercase, and numbers</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-new-password"
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

            <DialogFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !isPasswordValid || password !== confirmPassword}
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
                ) : (
                  "Update Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-4 space-y-3">
              <div className="rounded-full bg-green-500/10 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Your password has been changed. You can now sign in with your new password.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Back to Sign In
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
