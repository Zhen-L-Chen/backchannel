import type { Metadata, Viewport } from "next";
import {
  Anton,
  Baloo_2,
  Lora,
  Playfair_Display,
  Shrikhand,
  Space_Grotesk,
  Special_Elite,
  UnifrakturMaguntia,
} from "next/font/google";
import "./globals.css";

const blackletter = UnifrakturMaguntia({
  variable: "--font-blackletter",
  weight: "400",
  subsets: ["latin"],
});

const display = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const editorial = Playfair_Display({
  variable: "--font-editorial",
  weight: ["600", "700", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const typewriter = Special_Elite({
  variable: "--font-type",
  weight: "400",
  subsets: ["latin"],
});

const body = Lora({
  variable: "--font-body",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const gloss = Shrikhand({
  variable: "--font-gloss",
  weight: "400",
  subsets: ["latin"],
});

const bubble = Baloo_2({
  variable: "--font-bubble",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Backchannel: a conversational club",
  description:
    "We don’t do surveys. We host arguments. Take a side, claim a seat, speak in private.",
};

export const viewport: Viewport = {
  themeColor: "#F2EAD6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${blackletter.variable} ${display.variable} ${editorial.variable} ${typewriter.variable} ${body.variable} ${gloss.variable} ${bubble.variable} ${grotesk.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
