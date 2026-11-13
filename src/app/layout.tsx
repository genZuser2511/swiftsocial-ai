import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "SwiftSocial.AI - Revolutionizing Social Media with AI",
    template: "%s | SwiftSocial.AI",
  },
  description:
    "SwiftSocial.AI empowers content creators and businesses with intelligent automation, helping you create, schedule, and optimize your social media presence effortlessly. A project by Team Unnati at Indus University.",
  keywords: [
    "AI",
    "Social Media",
    "Automation",
    "Content Creation",
    "Team Unnati",
    "Indus University",
    "SwiftSocial",
  ],
  authors: [{ name: "Team Unnati" }],
  creator: "Team Unnati",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://swiftsocial.ai",
    siteName: "SwiftSocial.AI",
    title: "SwiftSocial.AI - Revolutionizing Social Media with AI",
    description:
      "Empowering content creators and businesses with intelligent AI-powered social media automation.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SwiftSocial.AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SwiftSocial.AI - Revolutionizing Social Media with AI",
    description:
      "Empowering content creators and businesses with intelligent AI-powered social media automation.",
    images: ["/og-image.png"],
    creator: "@swiftsocial_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  )
}

