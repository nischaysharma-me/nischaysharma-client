import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Merriweather } from "next/font/google";
import "../styles/globals.sass";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import { Toaster } from "sonner";
import { Dialog } from "@/components/ui/Dialog";
import NavigationWrapper from "@/components/NavigationWrapper";
import { ReadingModeProvider } from "@/components/ReadingModeProvider";
import { ImageCropProvider } from '@/components/image/ImageCropProvider';
import Script from "next/script";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nischaysharma.com'),
  title: {
    default: "Nischay Sharma | Portfolio, Technical Writing & Inspiration",
    template: "%s | Nischay Sharma"
  },
  description: "Minimalist portfolio and magazine for Nischay Sharma. Explore technical stories, documentation, and curated collections.",
  keywords: ["Nischay Sharma", "Nishchay Sharma", "Nischay", "Nishchay", "Edvanta", "Thoughtjumper", "Thought Jumper", "TaughtCode", "Software Engineering", "Minimalist Portfolio", "Technical Writing"],
  authors: [{ name: "Nischay Sharma" }],
  creator: "Nischay Sharma",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nischaysharma.com",
    siteName: "Nischay Sharma",
    title: "Nischay Sharma | Portfolio, Technical Writing & Inspiration",
    description: "Minimalist portfolio and magazine for Nischay Sharma. Explore technical stories, documentation, and curated collections.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Nischay Sharma | Portfolio, Technical Writing & Inspiration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nischay Sharma | Portfolio, Technical Writing & Inspiration",
    description: "Minimalist portfolio and magazine for Nischay Sharma. Explore technical stories, documentation, and curated collections.",
    creator: "@nishuns",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
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
  verification: {
    google: "vTAXBoSbMgMyHBDuUiz6Mmn9lEwu-GHHUwbnER84lTk",
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
    "alternateName": ["Nishchay Sharma", "Nishchay", "Nischay"],
    "url": "https://nischaysharma.com",
    "jobTitle": "Software Engineer & Creator",
    "sameAs": [
      "https://github.com/nishuns",
      "https://linkedin.com/in/nischaysharma"
    ],
    "worksFor": [
      {
        "@type": "Organization",
        "name": "TaughtCode"
      },
      {
        "@type": "Organization",
        "name": "Thoughtjumper"
      }
    ],
    "alumniOf": [
      {
        "@type": "Organization",
        "name": "Edvanta"
      }
    ],
    "knowsAbout": [
      "Software Engineering",
      "AI Orchestration",
      "System Architecture",
      "Thoughtjumper",
      "Edvanta"
    ]
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${merriweather.variable} font-sans antialiased`}
      >
        <Script id="google-tag-manager" strategy="lazyOnload">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-NVGLQ2LM');`}
        </Script>
        <Script id="phosphor-icons" strategy="lazyOnload">
          {`for (const weight of ['regular', 'fill']) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/' + weight + '/style.css';
            document.head.appendChild(link);
          }`}
        </Script>
        <ReadingModeProvider>
          <ImageCropProvider>
            <Toaster position="top-right" richColors expand closeButton />
            <Dialog />
            <NavigationWrapper />
            <SmoothScrollProvider>
              {children}
            </SmoothScrollProvider>
          </ImageCropProvider>
        </ReadingModeProvider>
      </body>
    </html>
  );
}
