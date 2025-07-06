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
    <div className="absolute top-0 left-0 w-full pt-4 pb-4" style={{ background: 'transparent', zIndex: 50 }}>
      <div className="flex flex-col items-center w-full">
        <img src="/uploads/Certifyr Black Logotype.png" alt="Certifyr Black Logotype" className="h-24 pt-3 mb-3 object-contain" />
        <div className="w-full pt-0">
          <div className="flex items-center justify-between w-full px-0 py-6 max-w-6xl mx-auto">
            {stages.map((stage, index) => (
              <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center">
                  <motion.div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      currentStage > stage.id
                        ? "bg-[#1b80ff] border-[#1b80ff] text-white"
                        : currentStage === stage.id
                        ? "bg-[#1b80ff] border-[#1b80ff] text-white"
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
                    currentStage >= stage.id ? "text-[#1b80ff]" : "text-gray-400"
                  )}>
                    {stage.name}
                  </span>
                </div>
                
                {index < stages.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className="h-0.5 bg-gray-200 relative overflow-hidden">
                      <motion.div
                        className="h-full bg-[#1b80ff]"
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
    </div>
  );
}
