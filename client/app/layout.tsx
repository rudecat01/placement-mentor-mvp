import type { Metadata } from "next";
import { Inter, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AuthModal } from "@/components/modals/auth-modal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "placeMate",
  description: "Professional Career Accelerator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} antialiased font-sans bg-background text-foreground`}
      >
        <Providers>
          {children}
          <AuthModal />
        </Providers>
      </body>
    </html>
  );
}
