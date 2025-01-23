import type { Metadata } from "next";
import { Inter, Poiret_One, Afacad } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const poiretOne = Poiret_One({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
});
const afacad = Afacad({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});


export const metadata: Metadata = {
  title: "2025 Bingo Goals",
  description: "Track your 2025 goals with a fun bingo board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${afacad.className} ${poiretOne.className}`}>{children}</body>
    </html>
  );
}
