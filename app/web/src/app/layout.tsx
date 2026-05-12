import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1e6" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1117" },
  ],
};

export const metadata: Metadata = {
  title: "Pikseliş",
  description: "Yapay Zeka Destekli İş ve Maaş Yönetim Sistemi",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pikseliş",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

import { ChatWidget } from "@/components/chat/ChatWidget";
import { ClientOnly } from "@/components/providers/ClientOnly";
import { CapacitorNativeProvider } from "@/components/providers/CapacitorNativeProvider";
import { ContextMenuProvider } from "@/components/ui/ContextMenu";
import { ToastProvider } from "@/components/ui/toast";
import { InstallAppBanner } from "@/components/ui/InstallAppBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased h-[100dvh] w-full bg-transparent text-foreground flex overflow-hidden transition-colors duration-500`} suppressHydrationWarning>
        {/* Arka Plan — Statik gradient (animate-pulse + blur kaldırıldı, CPU/GPU tasarrufu) */}
        <div className="fixed inset-0 -z-50 pointer-events-none" suppressHydrationWarning>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/50 dark:from-[#080B14] dark:via-[#0F1423] dark:to-[#0A0D18] transition-colors duration-700" suppressHydrationWarning />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-400/8 dark:bg-indigo-600/8 blur-[80px] rounded-full" suppressHydrationWarning />
          <div className="absolute bottom-[-200px] left-[-200px] w-[400px] h-[400px] bg-purple-400/8 dark:bg-purple-600/8 blur-[60px] rounded-full" suppressHydrationWarning />
        </div>

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <ClientOnly>
            <ToastProvider>
              <div className="flex flex-col w-full h-full relative z-0">
                {/* Ana İçerik — Navbar artık page.tsx içinde */}
                <main className="flex-1 flex flex-col h-full relative">
                  {children}
                </main>
              </div>
              
              {/* Global Widgets */}
              <ChatWidget />
              <CapacitorNativeProvider />
              <ContextMenuProvider />
              <InstallAppBanner />
            </ToastProvider>
          </ClientOnly>
        </ThemeProvider>
      </body>
    </html>
  );
}
