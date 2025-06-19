import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const result = await sql`SELECT DISTINCT category FROM products ORDER BY category`
    const categories = result.map((row) => row.category).filter(Boolean)
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Error fetching categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { category } = await request.json()

    if (!category) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    // Verificar si la categoría ya existe
    const existingCheck = await sql`SELECT COUNT(*) FROM products WHERE category = ${category}`

    if (Number.parseInt(existingCheck[0].count) > 0) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 })
    }

    // Crear un producto de ejemplo en la nueva categoría
    await sql`
      INSERT INTO products (name, description, price, category)
      VALUES ('Nuevo Producto', 'Descripción del producto', 0.00, ${category})
    `

    return NextResponse.json({ success: true, category })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Error creating category" }, { status: 500 })
  }
}
