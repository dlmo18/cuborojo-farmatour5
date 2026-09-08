import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Farmatour 5 - Manager System",
  description: "Panel de administración de Farmatour5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
