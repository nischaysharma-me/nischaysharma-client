import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "../styles/globals.sass";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import { Toaster } from "sonner";
import RealtimeNotificationHandler from "@/components/RealtimeNotificationHandler";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Nischay Sharma - For Downtime & Inspiration",
  description: "Minimalist portfolio and magazine for Nischay Sharma.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${playfair.variable} font-sans antialiased`}
      >
        <Toaster position="top-right" richColors expand closeButton />
        <RealtimeNotificationHandler />
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
