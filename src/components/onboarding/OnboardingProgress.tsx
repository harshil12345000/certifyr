
import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Stage {
  id: number;
  name: string;
  title: string;
}

interface OnboardingProgressProps {
  stages: Stage[];
  currentStage: number;
}

export function OnboardingProgress({ stages, currentStage }: OnboardingProgressProps) {
  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center">
                <motion.div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    currentStage > stage.id
                      ? "bg-blue-600 border-blue-600 text-white"
                      : currentStage === stage.id
                      ? "bg-blue-600 border-blue-600 text-white animate-pulse"
                      : "bg-white border-gray-300 text-gray-400"
                  )}
                  whileHover={{ scale: 1.05 }}
                >
                  {currentStage > stage.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{stage.id}</span>
                  )}
                </motion.div>
                <span className={cn(
                  "text-xs mt-2 font-medium transition-colors",
                  currentStage >= stage.id ? "text-blue-600" : "text-gray-400"
                )}>
                  {stage.name}
                </span>
              </div>
              
              {index < stages.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className="h-0.5 bg-gray-200 relative overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-600"
                      initial={{ width: "0%" }}
                      animate={{
                        width: currentStage > stage.id ? "100%" : "0%"
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
