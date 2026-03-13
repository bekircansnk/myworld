"use client"

import { motion } from "motion/react";
import React from "react";

interface MiniRobotProps {
  onClick?: () => void;
  className?: string;
}

export function MiniRobot({ onClick, className }: MiniRobotProps) {
  return (
    <div 
      className={`relative flex items-center justify-center cursor-pointer group ${className || ''}`}
      onClick={onClick}
    >
      {/* Floor Shadow */}
      <div className="absolute -bottom-2 w-12 h-2 bg-black/10 dark:bg-black/40 rounded-full blur-sm" />
      
      {/* Robot Body Container */}
      <motion.div 
        className="relative z-10 flex flex-col items-center group-hover:scale-110 transition-transform duration-300"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Main Body Sphere */}
        <div className="relative w-16 h-16 bg-gradient-to-br from-white to-[#E8E8E8] dark:from-[#2A2A35] dark:to-[#1A1A24] rounded-full shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.1),2px_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.4),2px_2px_8px_rgba(0,0,0,0.4)] border border-white/50 dark:border-white/10 flex items-center justify-center overflow-hidden">
          
          {/* Face Screen Area */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-6 bg-[#F0F0F0] dark:bg-[#0A0A10] rounded-[10px] shadow-inner flex items-center justify-center">
            {/* Glowing Eyes */}
            <div className="flex gap-2">
              <motion.div 
                className="w-1.5 h-[3px] bg-[#FFB400] rounded-full shadow-[0_0_5px_#FFB400]"
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, times: [0, 0.95, 1], delay: 1 }}
              />
              <motion.div 
                className="w-1.5 h-[3px] bg-[#FFB400] rounded-full shadow-[0_0_5px_#FFB400]"
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, times: [0, 0.95, 1], delay: 1 }}
              />
            </div>
          </div>

          {/* Subtle Surface Details */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 bg-white/40 dark:bg-white/10 blur-md rounded-full" />
          </div>
        </div>

        {/* Floating Rings (as seen in the image) */}
        <div className="absolute -top-2 -right-1 flex flex-col gap-0.5 opacity-60">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full border border-[#FFB400]"
              animate={{ 
                y: [0, -4, 0],
                rotate: [0, 10, 0],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: i * 0.5
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Ambient Glow behind robot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#FFB400]/20 blur-[20px] rounded-full pointer-events-none" />
    </div>
  );
}
