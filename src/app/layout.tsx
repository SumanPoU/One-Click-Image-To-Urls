import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import {
  Poppins,
  Lora,
  Roboto,
  DM_Serif_Display,
  Solway,
  Playfair_Display,
  Dancing_Script,
  Lato,
  Nunito,
} from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif-display",
});

const solway = Solway({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-solway",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Image Uploader",
  description: "Upload images and get URLs with multiple API key fallback",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`
        ${poppins.variable} 
        ${lora.variable} 
        ${roboto.variable} 
        ${dmSerifDisplay.variable} 
        ${solway.variable} 
        ${playfairDisplay.variable} 
        ${dancingScript.variable} 
        ${lato.variable} 
        ${nunito.variable}
      `}
      >
        {children}
      </body>
    </html>
  );
}
