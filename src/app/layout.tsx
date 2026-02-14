import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "For My Valentine ❤️",
  description: "A little corner of the internet just for you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {/* Global Floating Hearts */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="floating-heart">❤</div>
          <div className="floating-heart">❤</div>
          <div className="floating-heart">❤</div>
          <div className="floating-heart">❤</div>
          <div className="floating-heart">❤</div>
          <div className="floating-heart">❤</div>
          <div className="floating-heart">❤</div>
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
