import type { Metadata, Viewport } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "../styles/globals.sass";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import { Toaster } from "sonner";
import RealtimeNotificationHandler from "@/components/RealtimeNotificationHandler";
import SplashLoader from "@/components/SplashLoader";
import { Dialog } from "@/components/ui/Dialog";
import NavigationWrapper from "@/components/NavigationWrapper";

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
  metadataBase: new URL('https://nischaysharma.com'),
  title: {
    default: "Nischay Sharma - For Downtime & Inspiration",
    template: "%s | Nischay Sharma"
  },
  description: "Minimalist portfolio and magazine for Nischay Sharma. Explore technical stories, documentation, and curated collections.",
  keywords: ["Nischay Sharma", "TaughtCode", "Software Engineering", "Minimalist Portfolio", "Technical Writing"],
  authors: [{ name: "Nischay Sharma" }],
  creator: "Nischay Sharma",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nischaysharma.com",
    siteName: "Nischay Sharma",
    title: "Nischay Sharma - For Downtime & Inspiration",
    description: "Minimalist portfolio and magazine for Nischay Sharma.",
    images: [
      {
        url: "/architectural-concrete-monument.png",
        width: 1200,
        height: 630,
        alt: "Nischay Sharma Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nischay Sharma - For Downtime & Inspiration",
    description: "Minimalist portfolio and magazine for Nischay Sharma.",
    creator: "@nishuns",
    images: ["/architectural-concrete-monument.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Nischay Sharma",
    "url": "https://nischaysharma.com",
    "jobTitle": "Software Engineer & Creator",
    "sameAs": [
      "https://github.com/nishuns",
      "https://linkedin.com/in/nischaysharma"
    ],
    "worksFor": {
      "@type": "Organization",
      "name": "TaughtCode"
    }
  };

  return (
    <html lang="en">
      <head>
        <script src="https://unpkg.com/@phosphor-icons/web" async></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${poppins.variable} ${playfair.variable} font-sans antialiased`}
      >
        <SplashLoader />
        <Toaster position="top-right" richColors expand closeButton />
        <Dialog />
        <RealtimeNotificationHandler />
        <NavigationWrapper />
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
