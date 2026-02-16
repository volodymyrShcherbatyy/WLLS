import type { Metadata } from "next";
import "./globals.css";

import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "WLLS - Language Learning",
  description: "MVP language learning service"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main className="mx-auto min-h-screen max-w-5xl p-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
