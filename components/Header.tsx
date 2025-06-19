"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo">ElSitio-Restobar</div>
        <nav className="nav-links">
          <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
            Pedidos
          </Link>
          <Link href="/ordenes" className={`nav-link ${pathname === "/ordenes" ? "active" : ""}`}>
            Órdenes
          </Link>
          <Link href="/admin" className={`nav-link ${pathname === "/admin" ? "active" : ""}`}>
            Dashboard
          </Link>
          <Link href="/admin/productos" className={`nav-link ${pathname === "/admin/productos" ? "active" : ""}`}>
            Productos
          </Link>
        </nav>
      </div>
    </header>
  )
}
