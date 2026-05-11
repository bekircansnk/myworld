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
      className="fixed z-[9999] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200/80 dark:border-white/10 w-52 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-100 ease-out"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={handleMenuContextMenu}
    >
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => { opt.onClick(); closeMenu(); }}
          className={`flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium transition-colors text-left w-full
            ${opt.destructive 
              ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10' 
              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }
          `}
        >
          {opt.icon && (
            <span className={`w-4 h-4 shrink-0 flex items-center justify-center ${opt.destructive ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
              {opt.icon}
            </span>
          )}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
