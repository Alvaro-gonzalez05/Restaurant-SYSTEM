"use client"

import type React from "react"

import { useState } from "react"
import type { Order } from "@/lib/models"
import Swal from "sweetalert2"

interface OrderDetailsProps {
  order: Order
  onUpdateStatus: (orderId: number, status: string) => Promise<void>
  onProcessPayment: (orderId: number, paymentMethod: string) => Promise<void>
  onEdit: (order: Order) => void
}

export default function OrderDetails({ order, onUpdateStatus, onProcessPayment, onEdit }: OrderDetailsProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value

    setIsProcessing(true)
    try {
      await onUpdateStatus(order.id!, newStatus)

      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: `La orden ahora está ${getStatusText(newStatus)}`,
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el estado de la orden",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "pendiente"
      case "preparing":
        return "en preparación"
      case "ready":
        return "lista"
      case "delivered":
        return "entregada"
      case "completed":
        return "completada"
      default:
        return status
    }
  }

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona un método de pago",
        text: "Debes seleccionar un método de pago para continuar",
      })
      return
    }

    setIsProcessing(true)
    try {
      await onProcessPayment(order.id!, selectedPaymentMethod)

      Swal.fire({
        icon: "success",
        title: "Pago procesado",
        text: "El pago ha sido procesado correctamente",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo procesar el pago",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Asegurarse de que el total_amount sea un número
  const totalAmount =
    typeof order.total_amount === "string" ? Number.parseFloat(order.total_amount) : order.total_amount

  return (
    <div className="order-details-container">
      <div className="order-details">
        <p className="order-customer">Cliente: {order.customer_name}</p>
        <p className="order-table">Mesa: {order.table_reference || order.table?.number || order.table_id}</p>
        <p className="order-time">Hora: {new Date(order.created_at || "").toLocaleString()}</p>

        {order.details && (
          <div className="order-details-section">
            <h4>Detalles del pedido:</h4>
            <p>{order.details}</p>
          </div>
        )}

        <div className="form-group" style={{ marginTop: "16px" }}>
          <label htmlFor="status" className="form-label">
            Estado:
          </label>
          <select
            id="status"
            className="form-select"
            value={order.status}
            onChange={handleStatusChange}
            disabled={order.paid || isProcessing}
          >
            <option value="pending">Pendiente</option>
            <option value="preparing">Preparando</option>
            <option value="ready">Listo</option>
            <option value="delivered">Entregado</option>
            <option value="completed">Completado</option>
          </select>
        </div>
      </div>

      <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>Productos:</h3>
      <div className="order-items">
        {order.items.map((item, index) => {
          // Asegurarse de que el precio sea un número
          const price = typeof item.price === "string" ? Number.parseFloat(item.price) : item.price

          return (
            <div key={index} className="order-item">
              <span>
                {item.quantity}x {item.product?.name || `Producto #${item.product_id}`}
              </span>
              <span>${(price * item.quantity).toFixed(2)}</span>
            </div>
          )
        })}
      </div>

      <div className="order-total">Total: ${totalAmount.toFixed(2)}</div>

      {!order.paid && (
        <>
          <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>Método de Pago:</h3>
          <div className="payment-options">
            <div
              className={`payment-option ${selectedPaymentMethod === "cash" ? "selected" : ""}`}
              onClick={() => setSelectedPaymentMethod("cash")}
            >
              <div className="payment-option-icon">💵</div>
              <div className="payment-option-label">Efectivo</div>
            </div>

            <div
              className={`payment-option ${selectedPaymentMethod === "card" ? "selected" : ""}`}
              onClick={() => setSelectedPaymentMethod("card")}
            >
              <div className="payment-option-icon">💳</div>
              <div className="payment-option-label">Tarjeta</div>
            </div>

            <div
              className={`payment-option ${selectedPaymentMethod === "mercado_pago" ? "selected" : ""}`}
              onClick={() => setSelectedPaymentMethod("mercado_pago")}
            >
              <div className="payment-option-icon">📱</div>
              <div className="payment-option-label">Mercado Pago</div>
            </div>
          </div>
        </>
      )}

      <div className="panel-actions">
        <button className="btn btn-outline btn-with-icon" onClick={() => onEdit(order)} disabled={isProcessing}>
          <i className="icon-edit"></i>
          Editar Orden
        </button>

        {!order.paid && (
          <button
            className={`btn btn-primary ${isProcessing ? "btn-loading" : ""}`}
            onClick={handlePayment}
            disabled={!selectedPaymentMethod || isProcessing}
          >
            {isProcessing ? "Procesando..." : "Procesar Pago"}
          </button>
        )}
      </div>
    </div>
  )
}
