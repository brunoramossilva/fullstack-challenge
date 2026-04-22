import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LayoutProvider, UiProvider } from "@uigovpe/components";
import "@uigovpe/styles";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Product Manager",
  description: "Sistema de gerenciamento de produtos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        <LayoutProvider>
          <UiProvider>{children}</UiProvider>
        </LayoutProvider>
      </body>
    </html>
  );
}
