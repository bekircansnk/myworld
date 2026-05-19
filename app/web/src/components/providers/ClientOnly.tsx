"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { GlobalContextMenu } from '@/components/ui/GlobalContextMenu'

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = React.useState(false)

  // We cannot use hooks directly from stores if they are not client side, but ClientOnly is marked "use client".
  // To avoid circular dependencies or hydration issues, we can just require it dynamically or import normally since we are in "use client".

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-transparent" suppressHydrationWarning>
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" suppressHydrationWarning />
      </div>
    )
  }

  const handleGlobalContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Mobil uygulamada (Capacitor) veya dokunmatik cihazlarda genel arkaplan sağ tık menüsünü GÖSTERME
    if (typeof window !== 'undefined') {
      const isNativeCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();
      const isTouch = window.matchMedia("(pointer: coarse)").matches;
      if (isNativeCapacitor || isTouch) {
        return;
      }
    }

    // Default fallback context menu if no specific one intercepts it
    import('@/stores/contextMenuStore').then(({ useContextMenuStore }) => {
      import('lucide-react').then(({ RefreshCw, ArrowLeft, ArrowRight }) => {
        useContextMenuStore.getState().openMenu(e.clientX, e.clientY, [
          { label: 'Geri', icon: <ArrowLeft className="w-4 h-4"/>, onClick: () => window.history.back() },
          { label: 'İleri', icon: <ArrowRight className="w-4 h-4"/>, onClick: () => window.history.forward() },
          { label: 'Yenile', icon: <RefreshCw className="w-4 h-4"/>, onClick: () => window.location.reload() },
        ]);
      });
    });
  };

  return (
    <div className="contents" onContextMenu={handleGlobalContextMenu}>
      {children}
      <GlobalContextMenu />
    </div>
  );
}
