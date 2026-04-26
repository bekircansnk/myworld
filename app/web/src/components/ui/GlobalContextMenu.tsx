"use client";
import React, { useEffect, useRef } from 'react';
import { useContextMenuStore } from '@/stores/contextMenuStore';

export function GlobalContextMenu() {
  const { isOpen, x, y, options, closeMenu } = useContextMenuStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = () => { if (isOpen) closeMenu(); };
    window.addEventListener('click', handleClick);
    // Also close on scroll or window resize
    window.addEventListener('scroll', handleClick, true);
    window.addEventListener('resize', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleClick, true);
      window.removeEventListener('resize', handleClick);
    };
  }, [isOpen, closeMenu]);

  // Prevent context menu inside context menu
  const handleMenuContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="fixed z-[9999] bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 w-48 overflow-hidden py-1"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={handleMenuContextMenu}
    >
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => { opt.onClick(); closeMenu(); }}
          className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors text-left w-full
            ${opt.destructive 
              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10' 
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }
          `}
        >
          {opt.icon && <span className="w-4 h-4 flex items-center justify-center">{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
