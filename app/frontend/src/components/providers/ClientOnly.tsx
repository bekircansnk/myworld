"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = React.useState(false)

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

  return <>{children}</>
}
