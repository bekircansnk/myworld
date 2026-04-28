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
  title: "My World",
  description: "Kişisel Yapay Zeka Destekli Yaşam ve İş Yönetim Sistemi",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "My World",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

import { ChatWidget } from "@/components/chat/ChatWidget";
import { ClientOnly } from "@/components/providers/ClientOnly";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased h-screen w-full bg-transparent text-foreground flex overflow-hidden transition-colors duration-500`} suppressHydrationWarning>
        {/* Animated Background Patterns */}
        <div className="fixed inset-0 -z-50 pointer-events-none" suppressHydrationWarning>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/50 dark:from-[#080B14] dark:via-[#0F1423] dark:to-[#0A0D18] transition-colors duration-700" suppressHydrationWarning />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-400/10 dark:bg-indigo-600/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-70 animate-pulse" style={{ animationDuration: '8s' }} suppressHydrationWarning />
          <div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-purple-400/10 dark:bg-purple-600/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-60 animate-pulse" style={{ animationDuration: '10s' }} suppressHydrationWarning />
        </div>

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <ClientOnly>
            <div className="flex flex-col w-full h-full relative z-0">
              {/* Ana İçerik — Navbar artık page.tsx içinde */}
              <main className="flex-1 flex flex-col h-full relative">
                {children}
              </main>
            </div>
            
            {/* Global Widgets */}
            <ChatWidget />
          </ClientOnly>
        </ThemeProvider>
      </body>
    </html>
  );
}
