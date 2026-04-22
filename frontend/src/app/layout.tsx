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
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <LayoutProvider breakpoint={900} template="backoffice">
          <UiProvider>{children}</UiProvider>
        </LayoutProvider>
      </body>
    </html>
  );
}
