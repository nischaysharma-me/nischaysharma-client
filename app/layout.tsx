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
import StructuredData from "@/components/seo/StructuredData";
import { PERSON_ID, SITE_URL, canonicalSocialLinks } from "@/lib/seo/identity";

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
  description: "Official website of Nischay Sharma (Nishchay Sharma), software engineer, architect, creator, and technical writer. Explore his work, articles, projects, and profiles.",
  keywords: ["Nischay Sharma", "Nishchay Sharma", "Nischay", "Nishchay", "nischaysharma-me", "nischay.me", "Iamnischaysharma", "Edvanta", "Thoughtjumper", "Thought Jumper", "TaughtCode", "App Avengers", "Software Engineering", "Technical Writing"],
  authors: [{ name: "Nischay Sharma", url: "/about" }],
  creator: "Nischay Sharma",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nischaysharma.com",
    siteName: "Nischay Sharma",
    title: "Nischay Sharma | Portfolio, Technical Writing & Inspiration",
    description: "The official website of Nischay Sharma—software engineer, architect, creator, and technical writer.",
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
  alternates: {
    types: {
      'application/rss+xml': `${SITE_URL}/feed.xml`,
      'text/plain': `${SITE_URL}/llms.txt`,
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
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": SITE_URL,
        "name": "Nischay Sharma",
        "alternateName": ["Nishchay Sharma", "Nischay Sharma's Digital Anthology"],
        "publisher": { "@id": PERSON_ID }
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        "name": "Nischay Sharma",
        "alternateName": ["Nishchay Sharma", "Nischay", "Nishchay", "nischaysharma-me", "nischay.me", "Iamnischaysharma"],
        "url": `${SITE_URL}/about`,
        "image": `${SITE_URL}/og-image.jpg`,
        "sameAs": Object.values(canonicalSocialLinks)
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <StructuredData data={jsonLd} />
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
