import type { Metadata } from "next";
//import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Poppins, Merriweather } from "next/font/google";
import "./globals.css";

//const inter = Inter({ subsets: ["latin"] });

const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["600", "800"], 
  variable: "--font-poppins" 
});

const merriweather = Merriweather({ 
  subsets: ["latin"], 
  weight: ["400", "700"], 
  variable: "--font-merriweather" 
});

export const metadata: Metadata = {
  title: "NutriSync",
  description: "AI-powered nutrition assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${merriweather.variable}`}>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}
