import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/themes";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghost Assistant",
  description: "Real-time collaborative system design workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body
        className="min-h-full flex flex-col font-sans antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ClerkProvider appearance={clerkAppearance}>
            {children}
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}