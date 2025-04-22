import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { DashboardMetrics } from "@/lib/models"

export async function GET() {
  try {
    // Total de ventas
    const totalSalesResult = await sql`
      SELECT COALESCE(SUM(total_amount), 0) as total_sales
      FROM orders
      WHERE paid = true
    `

    // Órdenes completadas
    const ordersCompletedResult = await sql`
      SELECT COUNT(*) as orders_completed
      FROM orders
      WHERE status = 'completed' AND paid = true
    `

    // Órdenes pendientes
    const pendingOrdersResult = await sql`
      SELECT COUNT(*) as pending_orders
      FROM orders
      WHERE paid = false
    `

    // Valor promedio de órdenes
    const averageOrderValueResult = await sql`
      SELECT COALESCE(AVG(total_amount), 0) as average_order_value
      FROM orders
      WHERE paid = true
    `

    const metrics: DashboardMetrics = {
      totalSales: Number.parseFloat(totalSalesResult[0].total_sales) || 0,
      ordersCompleted: Number.parseInt(ordersCompletedResult[0].orders_completed) || 0,
      pendingOrders: Number.parseInt(pendingOrdersResult[0].pending_orders) || 0,
      averageOrderValue: Number.parseFloat(averageOrderValueResult[0].average_order_value) || 0,
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error)
    return NextResponse.json({
      totalSales: 0,
      ordersCompleted: 0,
      pendingOrders: 0,
      averageOrderValue: 0,
    })
  }
}
