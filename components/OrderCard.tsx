"use client"

import type React from "react"
import { useState } from "react"
import classNames from 'classnames'
import type { Order } from "@/lib/models"

interface OrderCardProps {
  order: Order
  onClick: (order: Order) => void
  onUpdateStatus?: (orderId: number, status: string) => void
}

export default function OrderCard({ order, onClick, onUpdateStatus }: OrderCardProps) {
  const [animateStatus, setAnimateStatus] = useState(false)

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "badge-warning"
      case "preparing":
        return "badge-primary"
      case "ready":
        return "badge-secondary"
      case "delivered":
        return "badge-success"
      case "completed":
        return "badge-success"
      default:
        return "badge-primary"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const handleStatusUpdate = (e: React.MouseEvent, newStatus: string) => {
    e.stopPropagation()
    if (onUpdateStatus && order.id) {
      setAnimateStatus(true)
      onUpdateStatus(order.id, newStatus)

      // Quitar la animación después de un tiempo
      setTimeout(() => {
        setAnimateStatus(false)
      }, 1000)
    }
  }

  // Asegurarse de que el total_amount sea un número
  const totalAmount =
    typeof order.total_amount === "string" ? Number.parseFloat(order.total_amount) : order.total_amount

  // Determinar qué botón de acción mostrar según el estado
  const renderStatusButton = () => {
    if (!onUpdateStatus) return null

    if (order.status === "pending") {
      return (
        <button className="btn btn-action btn-preparing" onClick={(e) => handleStatusUpdate(e, "preparing")}>
          <i className="icon-cooking"></i>
          <span>En Preparación</span>
        </button>
      )
    } else if (order.status === "preparing") {
      return (
        <button
          className={`btn btn-action btn-ready ${animateStatus ? "animate-status" : ""}`}
          onClick={(e) => handleStatusUpdate(e, "ready")}
        >
          <i className="icon-check"></i>
          <span>Pedido Listo</span>
          {animateStatus && <div className="status-animation"></div>}
        </button>
      )
    } else if (order.status === "ready") {
      return (
        <button className="btn btn-action btn-delivered" onClick={(e) => handleStatusUpdate(e, "delivered")}>
          <i className="icon-delivery"></i>
          <span>Entregar</span>
        </button>
      )
    }

    return null
  }

  // Determinar clases de color según el estado
  let cardClass = "order-card";
  let contentClass = "";

  if (order.status === "pending") {
    cardClass += " order-card-pending";
    contentClass = "order-content-pending";
  } else if (order.status === "completed" || order.status === "delivered") {
    cardClass += " order-card-completed";
    contentClass = "order-content-completed";
  }

  return (
    <div className={cardClass} onClick={() => onClick(order)}>
      <div className="order-header">
        <span className="order-id">Pedido #{order.id}</span>
        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
          {order.status === "pending"
            ? "Pendiente"
            : order.status === "preparing"
              ? "Preparando"
              : order.status === "ready"
                ? "Listo"
                : order.status === "delivered"
                  ? "Entregado"
                  : "Completado"}
        </span>
      </div>
      <div className={`order-details ${contentClass}`}>
        <p className="order-customer">Cliente: {order.customer_name}</p>
        <p className="order-table">Mesa: {order.table_reference || order.table_id}</p>
        <p className="order-time">Hora: {formatDate(order.created_at || "")}</p>
        {order.details && <p className="order-notes">Detalles: {order.details}</p>}
      </div>
      <div className={`order-total ${contentClass}`}>Total: ${totalAmount.toFixed(2)}</div>
      {order.items && order.items.length > 0 && (
        <div className={`order-products ${contentClass}`}>
          <p className="order-products-title">Productos:</p>
          <ul className="order-products-list">
            {order.items.map((item, index) => (
              <li key={index} className="order-product-item">
                {item.quantity}x {item.product?.name || `Producto #${item.product_id}`}
              </li>
            ))}
          </ul>
        </div>
      )}
      {renderStatusButton()}
    </div>
  )
}
