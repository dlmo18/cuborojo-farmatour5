import type { Metadata } from "next";
import "./globals.css";
import { WorldClassProvider } from "@/components/WorldClassProvider";

export const metadata: Metadata = {
  title: "Farmatour 5 - Juego de Gamificación",
  description: "Plataforma interactiva de aprendizaje y entretenimiento",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <WorldClassProvider />
        {children}
      </body>
    </html>
  );
}
