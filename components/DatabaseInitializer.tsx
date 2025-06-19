"use client"

import { useEffect, useState } from "react"
import { initializeDatabase } from "@/lib/db"

export default function DatabaseInitializer() {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      if (isInitializing) return

      setIsInitializing(true)
      try {
        console.log("Starting database initialization...")
        await initializeDatabase()
        setInitialized(true)
        console.log("Database initialized successfully from component")
      } catch (err) {
        console.error("Error initializing database:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsInitializing(false)
      }
    }

    if (!initialized && !error && !isInitializing) {
      initialize()
    }
  }, [initialized, error, isInitializing])

  // Este componente no renderiza nada visible
  return null
}
