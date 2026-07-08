import type { Metadata, Viewport } from "next";
import {
  Anton,
  Lora,
  Playfair_Display,
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
      className={`${blackletter.variable} ${display.variable} ${editorial.variable} ${typewriter.variable} ${body.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
