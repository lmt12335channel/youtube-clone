import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YouTube Clone",
  description: "A YouTube clone built with Next.js 15, Drizzle, and tRPC.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <TRPCProvider>
          <body className={cn("antialiased", inter.className)}>
            {children}
            <Toaster />
          </body>
        </TRPCProvider>
      </html>
    </ClerkProvider>
  );
}