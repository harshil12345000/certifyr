import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";
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

          {/* Demo Video Placeholder */}
          <div className="relative">
            <Card className="aspect-video max-w-md mx-auto bg-gradient-to-br from-gray-100 to-gray-200 border-0 flex items-center justify-center group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-[#1b80ff] rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-700 transition-colors">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
                <p className="text-xl font-semibold text-gray-700">Demo Video</p>
                <p className="text-sm text-gray-500">See how Certifyr works</p>
              </div>
            </Card>
          </div>

          {/* Get Started Button */}
          <div className="pt-4">
            <Button
              onClick={onNext}
              size="lg"
              className="px-12 py-4 text-lg bg-[#1b80ff] hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 text-white transition-transform hover:scale-105"
            >
              Get Started
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
