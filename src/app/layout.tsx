import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ogoat — simulador de carreira",
  description: "Comece aos 16 anos, jogo a jogo, transferência a transferência. Construa a lenda do seu jogador.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0b0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider delay={200}>
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
            ogoat — simulador de carreira de futebol. Times e ligas são fictícios.
          </footer>
          <Toaster theme="dark" position="bottom-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
