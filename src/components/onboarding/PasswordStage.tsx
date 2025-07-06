import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingData } from "@/pages/Onboarding";
import { cn } from "@/lib/utils";

interface PasswordStageProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function PasswordStage({ data, updateData, onNext, onPrev }: PasswordStageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onNext();
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
      className="max-w-2xl mx-auto w-full"
    >
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-2xl pt-3">
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
                className="px-8 py-3 border-gray-300 hover:bg-gray-50"
              >
                Back
              </Button>
              
              <Button
                type="submit"
                disabled={!isValid}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
