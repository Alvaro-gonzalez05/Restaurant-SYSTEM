"use client"

import type React from "react"
import { useState } from "react"
import type { OrderItem, Table } from "@/lib/models"
import Swal from "sweetalert2"

interface CartProps {
  isOpen: boolean
  onClose: () => void
  items: OrderItem[]
  onUpdateQuantity: (item: OrderItem, quantity: number) => void
  onRemoveItem: (item: OrderItem) => void
  onCheckout: (customerName: string, tableReference: string, orderDetails: string) => Promise<void>
  tables: Table[]
}

export default function Cart({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  tables,
}: CartProps) {
  const [customerName, setCustomerName] = useState("")
  const [tableReference, setTableReference] = useState("")
  const [orderDetails, setOrderDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Asegurarse de que los precios sean números
  const totalAmount = items.reduce((sum, item) => {
    const price = typeof item.price === "string" ? Number.parseFloat(item.price) : item.price
    return sum + price * item.quantity
  }, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerName || !tableReference) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Por favor completa el nombre del cliente y la referencia de mesa",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await onCheckout(customerName, tableReference, orderDetails)

      Swal.fire({
        icon: "success",
        title: "¡Pedido creado!",
        text: "Tu pedido ha sido creado con éxito",
        timer: 1500,
        showConfirmButton: false,
      })

      // Limpiar el formulario
      setCustomerName("")
      setTableReference("")
      setOrderDetails("")
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear el pedido. Inténtalo de nuevo.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`cart ${isOpen ? "open" : ""}`}>
      <div className="cart-header">
        <h2 className="cart-title">Pedido Actual</h2>
        <button className="close-cart" onClick={onClose}>
          &times;
        </button>
      </div>

      <div className="cart-items">
        {items.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-message">No hay productos en el pedido</p>
            <p className="empty-state-description">Agrega productos desde el menú</p>
          </div>
        ) : (
          items.map((item) => {
            // Asegurarse de que el precio sea un número
            const price = typeof item.price === "string" ? Number.parseFloat(item.price) : item.price

            return (
              <div key={item.product_id} className="cart-item">
                <div className="cart-item-info">
                  <h4 className="cart-item-name">{item.product?.name}</h4>
                  <p className="cart-item-price">${price.toFixed(2)}</p>
                </div>
                <div className="cart-item-quantity">
                  <button
                    className="quantity-btn"
                    onClick={() => onUpdateQuantity(item, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button className="quantity-btn" onClick={() => onUpdateQuantity(item, item.quantity + 1)}>
                    +
                  </button>
                  <button className="quantity-btn" onClick={() => onRemoveItem(item)} style={{ marginLeft: "8px" }}>
                    &times;
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="cart-footer">
        <div className="cart-total">
          <span>Total:</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>

        {items.length > 0 && (
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="customerName" className="form-label">
                Nombre del Cliente
              </label>
              <input
                type="text"
                id="customerName"
                className="form-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tableReference" className="form-label">
                Referencia de Mesa
              </label>
              <input
                type="text"
                id="tableReference"
                className="form-input"
                value={tableReference}
                placeholder="Ej: Mesa 3, Terraza, Barra..."
                onChange={(e) => setTableReference(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="orderDetails" className="form-label">
                Detalles del Pedido
              </label>
              <textarea
                id="orderDetails"
                className="form-input"
                value={orderDetails}
                placeholder="Instrucciones especiales, alergias, preferencias..."
                onChange={(e) => setOrderDetails(e.target.value)}
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-block ${isSubmitting ? "btn-loading" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Procesando..." : "Confirmar Pedido"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
