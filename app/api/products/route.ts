import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { Product } from "@/lib/models"

export async function GET() {
  try {
    const products = await sql`SELECT * FROM products ORDER BY category, name`
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const product: Product = await request.json()

    const result = await sql`
      INSERT INTO products (name, description, price, category, image_url)
      VALUES (${product.name}, ${product.description}, ${product.price}, ${product.category}, ${product.image_url || null})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Error creating product" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const product: Product = await request.json()

    const result = await sql`
      UPDATE products 
      SET name = ${product.name}, 
          description = ${product.description}, 
          price = ${product.price}, 
          category = ${product.category}, 
          image_url = ${product.image_url || null}
      WHERE id = ${product.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Error updating product" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Verificar si el producto está siendo utilizado en alguna orden
    const usageCheck = await sql`SELECT COUNT(*) FROM order_items WHERE product_id = ${id}`

    if (Number.parseInt(usageCheck[0].count) > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete product because it is being used in orders",
        },
        { status: 400 },
      )
    }

    const result = await sql`DELETE FROM products WHERE id = ${id} RETURNING *`

    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Error deleting product" }, { status: 500 })
  }
}
