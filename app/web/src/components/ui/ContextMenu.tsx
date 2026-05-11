"use client"

import React from 'react';
import { createPortal } from 'react-dom';

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
  separator?: boolean; // Bu item'dan önce ayraç koy
}

interface ContextMenuState {
  x: number;
  y: number;
  items: ContextMenuItem[];
}

// Global singleton state — uygulama genelinde tek bir context menu
let _setState: ((s: ContextMenuState | null) => void) | null = null;

export function showContextMenu(e: React.MouseEvent, items: ContextMenuItem[]) {
  e.preventDefault();
  e.stopPropagation();
  if (_setState) {
    _setState({ x: e.clientX, y: e.clientY, items });
  }
}

/** Sayfaya bir kez ekle, App ya da root layout'a koy */
export function ContextMenuProvider() {
  const [menu, setMenu] = React.useState<ContextMenuState | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    _setState = setMenu;
    return () => { _setState = null; };
  }, []);

  // Tıklama veya Escape ile kapat
  React.useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const keyClose = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(null); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', keyClose);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', keyClose);
    };
  }, [menu]);

  // Ekran sınırları hesapla
  const [adjustedPos, setAdjustedPos] = React.useState({ x: 0, y: 0 });
  React.useEffect(() => {
    if (!menu || !menuRef.current) {
      setAdjustedPos({ x: menu?.x ?? 0, y: menu?.y ?? 0 });
      return;
    }
    const rect = menuRef.current.getBoundingClientRect();
    let x = menu.x;
    let y = menu.y;
    if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width - 8;
    if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height - 8;
    setAdjustedPos({ x, y });
  }, [menu]);

  if (!menu || typeof document === 'undefined') return null;

  const content = (
    <div className="fixed inset-0 z-[999998]" style={{ pointerEvents: 'none' }}>
      <div
        ref={menuRef}
        className="absolute min-w-[180px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-white/10 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={{
          left: adjustedPos.x,
          top: adjustedPos.y,
          pointerEvents: 'auto',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {menu.items.map((item, idx) => (
          <React.Fragment key={idx}>
            {item.separator && (
              <div className="my-1 border-t border-slate-100 dark:border-white/10" />
            )}
            <button
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  setMenu(null);
                }
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-left transition-colors disabled:opacity-40 ${
                item.variant === 'destructive'
                  ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              {item.icon && (
                <span className={`w-4 h-4 shrink-0 ${item.variant === 'destructive' ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
