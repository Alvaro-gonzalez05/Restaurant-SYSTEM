import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const tables = await sql`SELECT * FROM tables ORDER BY number`
    return NextResponse.json(tables)
  } catch (error) {
    console.error("Error fetching tables:", error)
    return NextResponse.json({ error: "Error fetching tables" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json()

    const result = await sql`
      UPDATE tables 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id} 
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating table:", error)
    return NextResponse.json({ error: "Error updating table" }, { status: 500 })
  }
}
