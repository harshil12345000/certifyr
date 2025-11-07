import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { motion } from "framer-motion";

interface IntroStageProps {
  onNext: () => void;
}

export function IntroStage({ onNext }: IntroStageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto pt-3"
    >
      <Card className="p-12 text-center bg-white/70 backdrop-blur-sm border-0 shadow-2xl pt-3 mt-10">
        <div className="space-y-8">
          {/* Logo and Title */}
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center space-y-3">
              <img
                src="/uploads/Certifyr Logo.png"
                alt="Certifyr Logo"
                className="w-24 h-24 object-contain mx-auto"
              />
            </div>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Simplifying the way your organization does official documentation.
            </p>
          </div>


          {/* Get Started Button */}
          <div className="pt-4">
            <Button onClick={onNext} size="lg">
              Get Started
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
