"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import MetricCard from "@/components/MetricCard"
import DatabaseInitializer from "@/components/DatabaseInitializer"
import type { DashboardMetrics } from "@/lib/models"
import Link from "next/link"

export default function AdminPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalSales: 0,
    ordersCompleted: 0,
    pendingOrders: 0,
    averageOrderValue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Cargar datos del dashboard
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/dashboard")

      if (!response.ok) {
        throw new Error("Error fetching dashboard data")
      }

      const data = await response.json()
      setMetrics(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Establecer valores predeterminados en caso de error
      setMetrics({
        totalSales: 0,
        ordersCompleted: 0,
        pendingOrders: 0,
        averageOrderValue: 0,
      })
      setIsLoading(false)
    }
  }

  return (
    <>
      <DatabaseInitializer />
      <Header />
      <main className="main-content">
        <div className="container">
          <div className="card">
            <h1 className="card-title">Dashboard</h1>

            <div className="dashboard-grid">
              <MetricCard value={metrics.totalSales} label="Ventas Totales" prefix="$" />
              <MetricCard value={metrics.ordersCompleted} label="Órdenes Completadas" />
              <MetricCard value={metrics.pendingOrders} label="Órdenes Pendientes" />
              <MetricCard value={metrics.averageOrderValue} label="Valor Promedio" prefix="$" />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Acciones Rápidas</h2>
            </div>
            <div className="quick-actions">
              <Link href="/ordenes" className="btn btn-primary btn-large">
                <i className="icon-orders"></i>
                Ver Órdenes
              </Link>
              <Link href="/admin/productos" className="btn btn-primary btn-large">
                <i className="icon-products"></i>
                Gestionar Productos
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
