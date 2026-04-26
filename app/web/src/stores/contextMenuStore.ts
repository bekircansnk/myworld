import { create } from 'zustand';
import React from 'react';

export interface ContextMenuOption {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  options: ContextMenuOption[];
  openMenu: (x: number, y: number, options: ContextMenuOption[]) => void;
  closeMenu: () => void;
}

export const useContextMenuStore = create<ContextMenuState>((set) => ({
  isOpen: false,
  x: 0,
  y: 0,
  options: [],
  openMenu: (x, y, options) => {
    // Adjust coordinates if menu would go off-screen (approximate height/width)
    const menuWidth = 200;
    const menuHeight = options.length * 40 + 20;
    
    let adjustedX = x;
    let adjustedY = y;
    
    if (typeof window !== 'undefined') {
      if (x + menuWidth > window.innerWidth) adjustedX = window.innerWidth - menuWidth - 10;
      if (y + menuHeight > window.innerHeight) adjustedY = window.innerHeight - menuHeight - 10;
    }
    
    set({ isOpen: true, x: adjustedX, y: adjustedY, options });
  },
  closeMenu: () => set({ isOpen: false })
}));
