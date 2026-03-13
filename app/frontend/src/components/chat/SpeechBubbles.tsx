"use client"

import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useState } from "react";
import { useChatStore } from "@/stores/chatStore";

import { X } from "lucide-react";

export function SpeechBubbles() {
  const { lastAiMessage, showBubble, dismissBubble } = useChatStore();
  const [displayedText, setDisplayedText] = useState("");

  // Typewriter effect state
  useEffect(() => {
    if (showBubble && lastAiMessage) {
      setDisplayedText("");
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(lastAiMessage.slice(0, i));
        i++;
        if (i > lastAiMessage.length) {
          clearInterval(interval);
        }
      }, 30); // Text scrolling speed
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [showBubble, lastAiMessage]);

  return (
    <AnimatePresence>
      {showBubble && lastAiMessage && (
        <motion.div 
          className="absolute bottom-20 right-2 md:right-4 flex flex-col items-end z-40 pointer-events-none"
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative pointer-events-auto">
            {/* Context action to close bubble. */}
            <div className="absolute -top-2 -right-2 z-20">
              <button 
                onClick={(e) => { e.stopPropagation(); dismissBubble(); }}
                className="w-5 h-5 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-slate-50 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            <div 
              className="min-w-[240px] max-w-[280px] md:max-w-[340px] bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-2xl rounded-br-sm px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 dark:border-white/10 relative z-10 cursor-pointer hover:shadow-[0_8px_30px_rgb(255,180,0,0.15)] transition-shadow duration-300"
              onClick={() => {
                // Clicking bubble toggles chat and dismisses bubble
                useChatStore.getState().toggleChat();
                dismissBubble();
              }}
            >
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {displayedText}
                <motion.span 
                  animate={{ opacity: [1, 0, 1] }} 
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-1.5 h-3 ml-0.5 bg-brand-yellow align-middle"
                />
              </p>
            </div>
            
            {/* Thinking dots (sub-bubbles) */}
            <div className="absolute -bottom-3 right-4 flex flex-col items-center gap-1 z-0">
              <motion.div 
                className="w-3 h-3 rounded-full bg-white dark:bg-[#1A1A24] shadow-sm border border-slate-100 dark:border-slate-800"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              />
              <motion.div 
                className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#1A1A24] shadow-sm border border-slate-100 dark:border-slate-800 -mr-2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
