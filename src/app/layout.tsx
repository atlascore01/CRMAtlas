import type { Metadata } from "next";
import { Geist, Geist_Mono, Chakra_Petch } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Atlascore CRM | Innovación que Transforma",
  description: "Plataforma de gestión de clientes y evolución digital de Atlascore",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${chakraPetch.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#001412] text-[#F0EBD8] selection:bg-[#8BD990] selection:text-[#001412]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

