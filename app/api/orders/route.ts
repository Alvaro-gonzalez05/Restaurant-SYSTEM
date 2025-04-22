import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { Order } from "@/lib/models"
import { notifyNewOrder } from '@/lib/websocketServer';

export async function GET() {
  try {
    const orders = await sql`
      SELECT o.*, t.number as table_number 
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      ORDER BY o.created_at DESC
    `

    // Obtener los items para cada orden
    for (const order of orders) {
      const items = await sql`
        SELECT oi.*, p.name as product_name, p.description as product_description
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ${order.id}
      `

      order.items = items
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Error fetching orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const order: Order = await request.json()

    // Convertir el precio a número si es una cadena
    const totalAmount =
      typeof order.total_amount === "string" ? Number.parseFloat(order.total_amount) : order.total_amount

    // Insertar la orden primero
    const orderResult = await sql`
      INSERT INTO orders (
        table_id, 
        table_reference, 
        customer_name, 
        status, 
        total_amount, 
        paid, 
        details
      )
      VALUES (
        ${order.table_id || null}, 
        ${order.table_reference}, 
        ${order.customer_name}, 
        ${order.status}, 
        ${totalAmount}, 
        false, 
        ${order.details || null}
      )
      RETURNING *
    `

    const newOrder = orderResult[0]

    // Insertar los items de la orden
    for (const item of order.items) {
      const itemPrice = typeof item.price === "string" ? Number.parseFloat(item.price) : item.price

      const itemResult = await sql`
        INSERT INTO order_items (order_id, product_id, quantity, price, notes)
        VALUES (${newOrder.id}, ${item.product_id}, ${item.quantity}, ${itemPrice}, ${item.notes || ""})
        RETURNING *
      `

      // Obtener el nombre del producto para cada item
      const productResult = await sql`
        SELECT name, description FROM products WHERE id = ${item.product_id}
      `

      if (productResult.length > 0) {
        itemResult[0].product_name = productResult[0].name
        itemResult[0].product_description = productResult[0].description
      }

      // Inicializar el array de items si no existe
      if (!newOrder.items) {
        newOrder.items = []
      }

      // Agregar el item a la orden
      newOrder.items.push(itemResult[0])
    }

    // Actualizar el estado de la mesa si hay una mesa asignada
    if (order.table_id) {
      await sql`UPDATE tables SET status = 'occupied' WHERE id = ${order.table_id}`
    }

    // Notificar a los clientes sobre el nuevo pedido
    notifyNewOrder(newOrder);

    return NextResponse.json(newOrder)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Error creating order" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status, payment_method, paid, customer_name, table_reference, details, items } = await request.json()

    // Actualizar la orden
    const updatedOrder = await sql`
      UPDATE orders 
      SET status = COALESCE(${status}, status), 
          payment_method = COALESCE(${payment_method}, payment_method), 
          paid = COALESCE(${paid}, paid),
          customer_name = COALESCE(${customer_name}, customer_name),
          table_reference = COALESCE(${table_reference}, table_reference),
          details = COALESCE(${details}, details),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    // Si se proporcionaron nuevos items, actualizar los items de la orden
    if (items && Array.isArray(items)) {
      // Primero eliminar los items existentes
      await sql`DELETE FROM order_items WHERE order_id = ${id}`

      // Luego insertar los nuevos items
      for (const item of items) {
        const itemPrice = typeof item.price === "string" ? Number.parseFloat(item.price) : item.price

        await sql`
          INSERT INTO order_items (order_id, product_id, quantity, price, notes)
          VALUES (${id}, ${item.product_id}, ${item.quantity}, ${itemPrice}, ${item.notes || ""})
        `
      }
    }

    // Si la orden está pagada, liberar la mesa si hay una mesa asignada
    if (paid) {
      const order = updatedOrder[0]
      if (order.table_id) {
        await sql`UPDATE tables SET status = 'available' WHERE id = ${order.table_id}`
      }
    }

    return NextResponse.json(updatedOrder[0])
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Error updating order" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const all = searchParams.get("all")

    if (all === "true") {
      // Eliminar todas las órdenes
      await sql`DELETE FROM order_items`
      await sql`DELETE FROM orders`

      // Restablecer todas las mesas a disponible
      await sql`UPDATE tables SET status = 'available'`

      return NextResponse.json({ success: true, message: "All orders deleted successfully" })
    } else if (id) {
      // Obtener la orden para verificar si tiene una mesa asignada
      const orderResult = await sql`SELECT * FROM orders WHERE id = ${id}`

      if (orderResult.length === 0) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      const order = orderResult[0]

      // Eliminar la orden
      await sql`DELETE FROM order_items WHERE order_id = ${id}`
      await sql`DELETE FROM orders WHERE id = ${id}`

      // Si la orden tenía una mesa asignada, liberarla
      if (order.table_id) {
        await sql`UPDATE tables SET status = 'available' WHERE id = ${order.table_id}`
      }

      return NextResponse.json({ success: true, message: "Order deleted successfully" })
    } else {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error deleting order(s):", error)
    return NextResponse.json({ error: "Error deleting order(s)" }, { status: 500 })
  }
}
