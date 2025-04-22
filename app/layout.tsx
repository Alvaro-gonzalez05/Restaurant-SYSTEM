import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "El Sitio-Restobar",
  description: "Aplicación para gestión de restaurante",
    generator: 'v0.dev'
}

// Inicializar la base de datos al cargar la aplicación
// Movemos la inicialización a un componente del lado del cliente para evitar problemas en SSR
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="app-container">{children}</div>
      </body>
    </html>
  )
}


import './globals.css'