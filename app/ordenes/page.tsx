"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import OrderCard from "@/components/OrderCard"
import SlidingPanel from "@/components/SlidingPanel"
import OrderDetails from "@/components/OrderDetails"
import OrderEditModal from "@/components/OrderEditModal"
import DatabaseInitializer from "@/components/DatabaseInitializer"
import NotificationSound from "@/components/NotificationSound"
import type { Order, Product } from "@/lib/models"
import Swal from "sweetalert2"
import { io } from "socket.io-client";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [playNotification, setPlayNotification] = useState(false)
  const [newOrderId, setNewOrderId] = useState<number | null>(null)

  // Cargar órdenes
  useEffect(() => {
    fetchOrders()
    fetchProducts()

    // Conectar al servidor WebSocket usando socket.io
    const socketUrl = `wss://${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`; // Usar el dominio principal sin puerto

    const socket = io(socketUrl, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log("Conectado al servidor WebSocket");
    });

    socket.on('new-order', (order) => {
      console.log("Nueva orden recibida:", order);
      setOrders((prevOrders) => [order, ...prevOrders]);
      setPlayNotification(true);
      setNewOrderId(order.id);
    });

    socket.on('disconnect', () => {
      console.log("Desconectado del servidor WebSocket");
    });

    return () => {
      socket.disconnect();
    };
  }, [])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/orders")

      if (!response.ok) {
        throw new Error("Error fetching orders")
      }

      const data = await response.json()

      // Asegurarnos de que data es un array
      const ordersArray = Array.isArray(data) ? data : []
      setOrders(ordersArray)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setOrders([]) // Establecer un array vacío en caso de error
      setIsLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")

      if (!response.ok) {
        throw new Error("Error fetching products")
      }

      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
    }
  }

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      const response = await fetch("/api/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: orderId, status }),
      })

      if (response.ok) {
        // Actualizar la orden seleccionada
        const updatedOrder = await response.json()
        setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status } : prev))

        // Actualizar la lista de órdenes
        setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, status } : order)))

        return updatedOrder
      } else {
        const error = await response.json()
        throw new Error(error.message || "Error desconocido")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      throw error
    }
  }

  const handleProcessPayment = async (orderId: number, paymentMethod: string) => {
    try {
      const response = await fetch("/api/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: orderId,
          payment_method: paymentMethod,
          paid: true,
          status: "completed",
        }),
      })

      if (response.ok) {
        // Cerrar el panel
        setSelectedOrder(null)
        setIsPanelOpen(false)

        // Actualizar la lista de órdenes
        await fetchOrders()

        return true
      } else {
        const error = await response.json()
        throw new Error(error.message || "Error desconocido")
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      throw error
    }
  }

  const handleDeleteOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Cerrar los modales
        setSelectedOrder(null)
        setOrderToEdit(null)
        setIsPanelOpen(false)

        // Actualizar la lista de órdenes
        await fetchOrders()

        return true
      } else {
        const error = await response.json()
        throw new Error(error.message || "Error desconocido")
      }
    } catch (error) {
      console.error("Error deleting order:", error)
      throw error
    }
  }

  const handleDeleteAllOrders = async () => {
    Swal.fire({
      title: "¿Eliminar todas las órdenes?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef5350",
      cancelButtonColor: "#757575",
      confirmButtonText: "Sí, eliminar todas",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch("/api/orders?all=true", {
            method: "DELETE",
          })

          if (response.ok) {
            // Actualizar la lista de órdenes
            await fetchOrders()

            Swal.fire({
              icon: "success",
              title: "Eliminadas",
              text: "Todas las órdenes han sido eliminadas",
              timer: 1500,
              showConfirmButton: false,
            })
          } else {
            const error = await response.json()
            throw new Error(error.message || "Error desconocido")
          }
        } catch (error) {
          console.error("Error deleting all orders:", error)
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron eliminar las órdenes",
          })
        }
      }
    })
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(null) // Cerrar el panel si está abierto
    setIsPanelOpen(false)
    setOrderToEdit(order)
  }

  const handleSaveEditedOrder = async (editedOrder: Order) => {
    try {
      const response = await fetch("/api/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedOrder),
      })

      if (response.ok) {
        // Cerrar el modal
        setOrderToEdit(null)

        // Actualizar la lista de órdenes
        await fetchOrders()

        return true
      } else {
        const error = await response.json()
        throw new Error(error.message || "Error desconocido")
      }
    } catch (error) {
      console.error("Error updating order:", error)
      throw error
    }
  }

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order)
    setIsPanelOpen(true)
  }

  const handleNotificationPlayed = () => {
    setPlayNotification(false)

    // Mostrar notificación de nueva orden
    if (newOrderId) {
      Swal.fire({
        icon: "info",
        title: "Nueva Orden",
        text: `Se ha recibido una nueva orden #${newOrderId}`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      })
      setNewOrderId(null)
    }
  }

  // Filtrar órdenes según la pestaña activa
  const filteredOrders = Array.isArray(orders)
    ? orders.filter((order) => {
        if (activeTab === "pending") return !order.paid
        if (activeTab === "completed") return order.paid
        return true
      })
    : []

  return (
    <>
      <DatabaseInitializer />
      <Header />
      <NotificationSound play={playNotification} onPlay={handleNotificationPlayed} />
      <main className="main-content">
        <div className="container">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Órdenes</h2>
              <div>
                <button className="btn btn-primary" onClick={fetchOrders} style={{ marginRight: "10px" }}>
                  Actualizar
                </button>
                <button className="btn btn-danger" onClick={handleDeleteAllOrders} disabled={orders.length === 0}>
                  Eliminar Todas las Órdenes
                </button>
              </div>
            </div>

            <div className="tabs">
              <div className={`tab ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
                Todas
              </div>
              <div className={`tab ${activeTab === "pending" ? "active" : ""}`} onClick={() => setActiveTab("pending")}>
                Pendientes
              </div>
              <div
                className={`tab ${activeTab === "completed" ? "active" : ""}`}
                onClick={() => setActiveTab("completed")}
              >
                Completadas
              </div>
            </div>

            {isLoading ? (
              <div className="empty-state">
                <p className="empty-state-message">Cargando órdenes...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-message">No hay órdenes</p>
                <p className="empty-state-description">
                  {activeTab === "pending"
                    ? "No hay órdenes pendientes de pago"
                    : activeTab === "completed"
                      ? "No hay órdenes completadas"
                      : "No hay órdenes registradas"}
                </p>
              </div>
            ) : (
              <div className="orders-list">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onClick={handleOrderClick}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedOrder && (
          <SlidingPanel
            isOpen={isPanelOpen}
            onClose={() => {
              setIsPanelOpen(false)
              setTimeout(() => setSelectedOrder(null), 300) // Esperar a que termine la animación
            }}
            title={`Pedido #${selectedOrder.id}`}
          >
            <OrderDetails
              order={selectedOrder}
              onUpdateStatus={handleUpdateStatus}
              onProcessPayment={handleProcessPayment}
              onEdit={handleEditOrder}
            />
          </SlidingPanel>
        )}

        {orderToEdit && (
          <OrderEditModal
            order={orderToEdit}
            products={products}
            onClose={() => setOrderToEdit(null)}
            onSave={handleSaveEditedOrder}
            onDelete={handleDeleteOrder}
          />
        )}
      </main>
    </>
  )
}
