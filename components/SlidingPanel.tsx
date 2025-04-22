"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface SlidingPanelProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title: string
}

export default function SlidingPanel({ isOpen, onClose, children, title }: SlidingPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Manejar clic fuera del panel para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Manejar tecla Escape para cerrar el panel
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="sliding-panel-overlay">
      <div ref={panelRef} className={`sliding-panel ${isOpen ? "open" : ""}`}>
        <div className="sliding-panel-header">
          <h2 className="sliding-panel-title">{title}</h2>
          <button className="close-panel" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="sliding-panel-content">{children}</div>
      </div>
    </div>
  )
}
