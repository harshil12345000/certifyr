import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingData } from "@/pages/Onboarding";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PasswordStageProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function PasswordStage({ data, updateData, onNext, onPrev }: PasswordStageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      // Set the password on the user account (user was created via OTP in PersonalInfoStage)
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password Set",
        description: "Your password has been set successfully.",
      });
      
      onNext();
    } catch (error: any) {
      console.error("Error setting password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to set password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = {
    minLength: data.password.length >= 8,
    hasNumber: /\d/.test(data.password),
    hasLetter: /[a-zA-Z]/.test(data.password),
  };

  const passwordsMatch = data.password && data.confirmPassword && data.password === data.confirmPassword;
  const isValid = passwordStrength.minLength && passwordStrength.hasNumber && passwordStrength.hasLetter && passwordsMatch;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto w-full pt-3"
    >
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-2xl pt-3 mt-10">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Secure Your Account
          </CardTitle>
          <p className="text-gray-600">Create a strong password to protect your account</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Create Password *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={data.password}
                  onChange={(e) => updateData({ password: e.target.value })}
                  className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicators */}
              {data.password && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-center space-x-2 text-sm">
                    {passwordStrength.minLength ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                    <span className={cn(
                      passwordStrength.minLength ? "text-green-600" : "text-red-600"
                    )}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    {passwordStrength.hasNumber ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                    <span className={cn(
                      passwordStrength.hasNumber ? "text-green-600" : "text-red-600"
                    )}>
                      Contains a number
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    {passwordStrength.hasLetter ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                    <span className={cn(
                      passwordStrength.hasLetter ? "text-green-600" : "text-red-600"
                    )}>
                      Contains a letter
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={data.confirmPassword}
                  onChange={(e) => updateData({ confirmPassword: e.target.value })}
                  className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {data.confirmPassword && (
                <div className="flex items-center space-x-2 text-sm mt-2">
                  {passwordsMatch ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span className={cn(
                    passwordsMatch ? "text-green-600" : "text-red-600"
                  )}>
                    {passwordsMatch ? "Passwords match" : "Passwords don't match"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onPrev}
                disabled={loading}
                className="px-8 py-3 border-gray-300 hover:bg-gray-50 transition-transform hover:scale-105"
              >
                Back
              </Button>
              
              <Button
                type="submit"
                disabled={!isValid || loading}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting Password...
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
