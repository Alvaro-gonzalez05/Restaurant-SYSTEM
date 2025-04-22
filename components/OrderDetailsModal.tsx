"use client"

import type React from "react"

import { useState } from "react"
import type { Order } from "@/lib/models"

interface OrderDetailsModalProps {
  order: Order | null
  onClose: () => void
  onUpdateStatus: (orderId: number, status: string) => void
  onProcessPayment: (orderId: number, paymentMethod: string) => void
  onEdit: (order: Order) => void
}

export default function OrderDetailsModal({
  order,
  onClose,
  onUpdateStatus,
  onProcessPayment,
  onEdit,
}: OrderDetailsModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)

  if (!order) return null

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateStatus(order.id!, e.target.value)
  }

  const handlePayment = () => {
    if (selectedPaymentMethod) {
      onProcessPayment(order.id!, selectedPaymentMethod)
    }
  }

  // Asegurarse de que el total_amount sea un número
  const totalAmount =
    typeof order.total_amount === "string" ? Number.parseFloat(order.total_amount) : order.total_amount

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Detalles del Pedido #{order.id}</h2>
          <button className="close-modal" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
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
                disabled={order.paid}
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
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline btn-with-icon" onClick={() => onEdit(order)}>
            <i className="icon-edit"></i>
            Editar Orden
          </button>
          <button className="btn btn-outline" onClick={onClose}>
            Cerrar
          </button>
          {!order.paid && (
            <button className="btn btn-primary" onClick={handlePayment} disabled={!selectedPaymentMethod}>
              Procesar Pago
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
