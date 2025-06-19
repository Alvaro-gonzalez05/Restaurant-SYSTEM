"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Order, Product, OrderItem } from "@/lib/models"
import Swal from "sweetalert2"

interface OrderEditModalProps {
  order: Order
  products: Product[]
  onClose: () => void
  onSave: (order: Order) => Promise<void>
  onDelete: (orderId: number) => Promise<void>
}

export default function OrderEditModal({ order, products, onClose, onSave, onDelete }: OrderEditModalProps) {
  const [editedOrder, setEditedOrder] = useState<Order>({ ...order })
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<number | "">("")
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (products && products.length > 0) {
      setAvailableProducts(products)
    }
  }, [products])

  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedOrder({ ...editedOrder, customer_name: e.target.value })
  }

  const handleTableReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedOrder({ ...editedOrder, table_reference: e.target.value })
  }

  const handleDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedOrder({ ...editedOrder, details: e.target.value })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditedOrder({ ...editedOrder, status: e.target.value as any })
  }

  const handleAddItem = () => {
    if (!selectedProductId) return

    const productId = Number(selectedProductId)
    const product = products.find((p) => p.id === productId)

    if (!product) return

    const price = typeof product.price === "string" ? Number.parseFloat(product.price) : product.price

    const newItem: OrderItem = {
      product_id: productId,
      product: product,
      quantity: selectedQuantity,
      price: price,
      notes: "",
    }

    const updatedItems = [...editedOrder.items, newItem]

    // Recalcular el total
    const totalAmount = updatedItems.reduce((sum, item) => {
      const itemPrice = typeof item.price === "string" ? Number.parseFloat(item.price) : item.price
      return sum + itemPrice * item.quantity
    }, 0)

    setEditedOrder({
      ...editedOrder,
      items: updatedItems,
      total_amount: totalAmount,
    })

    // Resetear selección
    setSelectedProductId("")
    setSelectedQuantity(1)
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...editedOrder.items]
    updatedItems.splice(index, 1)

    // Recalcular el total
    const totalAmount = updatedItems.reduce((sum, item) => {
      const itemPrice = typeof item.price === "string" ? Number.parseFloat(item.price) : item.price
      return sum + itemPrice * item.quantity
    }, 0)

    setEditedOrder({
      ...editedOrder,
      items: updatedItems,
      total_amount: totalAmount,
    })
  }

  const handleUpdateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(index)
      return
    }

    const updatedItems = [...editedOrder.items]
    updatedItems[index] = { ...updatedItems[index], quantity }

    // Recalcular el total
    const totalAmount = updatedItems.reduce((sum, item) => {
      const itemPrice = typeof item.price === "string" ? Number.parseFloat(item.price) : item.price
      return sum + itemPrice * item.quantity
    }, 0)

    setEditedOrder({
      ...editedOrder,
      items: updatedItems,
      total_amount: totalAmount,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsProcessing(true)
    try {
      await onSave(editedOrder)

      Swal.fire({
        icon: "success",
        title: "Orden actualizada",
        text: "La orden ha sido actualizada correctamente",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar la orden",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef5350",
      cancelButtonColor: "#757575",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsProcessing(true)
        try {
          await onDelete(editedOrder.id!)

          Swal.fire({
            icon: "success",
            title: "Eliminada",
            text: "La orden ha sido eliminada correctamente",
            timer: 1500,
            showConfirmButton: false,
          })
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar la orden",
          })
        } finally {
          setIsProcessing(false)
        }
      }
    })
  }

  // Calcular el total
  const totalAmount = editedOrder.items.reduce((sum, item) => {
    const price = typeof item.price === "string" ? Number.parseFloat(item.price) : item.price
    return sum + price * item.quantity
  }, 0)

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Editar Orden #{editedOrder.id}</h2>
          <button className="close-modal" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="customerName" className="form-label">
                Nombre del Cliente
              </label>
              <input
                type="text"
                id="customerName"
                className="form-input"
                value={editedOrder.customer_name}
                onChange={handleCustomerNameChange}
                required
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
                value={editedOrder.table_reference}
                onChange={handleTableReferenceChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="details" className="form-label">
                Detalles del Pedido
              </label>
              <textarea
                id="details"
                className="form-input"
                value={editedOrder.details || ""}
                onChange={handleDetailsChange}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Estado
              </label>
              <select
                id="status"
                className="form-select"
                value={editedOrder.status}
                onChange={handleStatusChange}
                disabled={editedOrder.paid}
              >
                <option value="pending">Pendiente</option>
                <option value="preparing">Preparando</option>
                <option value="ready">Listo</option>
                <option value="delivered">Entregado</option>
                <option value="completed">Completado</option>
              </select>
            </div>

            <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>Productos:</h3>

            <div className="add-item-form">
              <div className="form-group">
                <label htmlFor="productSelect" className="form-label">
                  Agregar Producto
                </label>
                <div className="add-item-inputs">
                  <select
                    id="productSelect"
                    className="form-select"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  >
                    <option value="">Seleccionar producto</option>
                    {availableProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - $
                        {typeof product.price === "string"
                          ? Number.parseFloat(product.price).toFixed(2)
                          : product.price.toFixed(2)}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                    className="form-input quantity-input"
                  />

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddItem}
                    disabled={!selectedProductId}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>

            <div className="order-items">
              {editedOrder.items.map((item, index) => {
                const product = products.find((p) => p.id === item.product_id)
                const price = typeof item.price === "string" ? Number.parseFloat(item.price) : item.price

                return (
                  <div key={index} className="cart-item">
                    <div className="cart-item-info">
                      <h4 className="cart-item-name">{product?.name || `Producto #${item.product_id}`}</h4>
                      <p className="cart-item-price">${price.toFixed(2)}</p>
                    </div>
                    <div className="cart-item-quantity">
                      <button
                        type="button"
                        className="quantity-btn"
                        onClick={() => handleUpdateItemQuantity(index, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        className="quantity-btn"
                        onClick={() => handleUpdateItemQuantity(index, item.quantity + 1)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="quantity-btn"
                        onClick={() => handleRemoveItem(index)}
                        style={{ marginLeft: "8px" }}
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="order-total" style={{ marginTop: "20px" }}>
              Total: ${totalAmount.toFixed(2)}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={isProcessing}>
              Eliminar Orden
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isProcessing}>
              Cancelar
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${isProcessing ? "btn-loading" : ""}`}
              disabled={isProcessing}
            >
              {isProcessing ? "Guardando..." : "Confirmar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
