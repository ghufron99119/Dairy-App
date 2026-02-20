import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Nexus | Personal Dashboard",
  description: "A premium personal dashboard for scheduling, task management, and finance tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Script
          id="cleanup-scroll-lock"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `document.body.classList.remove('antigravity-scroll-lock');`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
