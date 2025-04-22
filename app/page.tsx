"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import ProductCard from "@/components/ProductCard"
import Cart from "@/components/Cart"
import DatabaseInitializer from "@/components/DatabaseInitializer"
import type { Product, OrderItem, Table, Order } from "@/lib/models"
import Swal from "sweetalert2"

export default function OrdersPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [cartItems, setCartItems] = useState<OrderItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Cargar productos y mesas
  useEffect(() => {
    fetchProducts()
    fetchTables()
  }, [])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/products")

      if (!response.ok) {
        throw new Error("Error fetching products")
      }

      const data = await response.json()

      // Asegurarnos de que data es un array
      const productsArray = Array.isArray(data) ? data : []
      setProducts(productsArray)

      // Extraer categorías únicas
      const uniqueCategories = Array.from(new Set(productsArray.map((product: Product) => product.category))).filter(
        Boolean,
      ) // Filtrar valores nulos o undefined

      setCategories(uniqueCategories as string[])
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([]) // Establecer un array vacío en caso de error
      setCategories([])
      setIsLoading(false)
    }
  }

  const fetchTables = async () => {
    try {
      const response = await fetch("/api/tables")

      if (!response.ok) {
        throw new Error("Error fetching tables")
      }

      const data = await response.json()

      // Asegurarnos de que data es un array
      const tablesArray = Array.isArray(data) ? data : []
      setTables(tablesArray)
    } catch (error) {
      console.error("Error fetching tables:", error)
      setTables([]) // Establecer un array vacío en caso de error
    }
  }

  const handleAddToCart = (product: Product) => {
    // Asegurarse de que el precio sea un número
    const price = typeof product.price === "string" ? Number.parseFloat(product.price) : product.price

    setCartItems((prevItems) => {
      // Verificar si el producto ya está en el carrito
      const existingItem = prevItems.find((item) => item.product_id === product.id)

      if (existingItem) {
        // Incrementar la cantidad si ya existe
        return prevItems.map((item) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      } else {
        // Agregar nuevo item si no existe
        return [
          ...prevItems,
          {
            product_id: product.id,
            product: product,
            quantity: 1,
            price: price,
          },
        ]
      }
    })

    // Mostrar notificación de producto agregado
    const Toast = Swal.mixin({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    })

    Toast.fire({
      icon: "success",
      title: `${product.name} agregado al carrito`,
    })

    setIsCartOpen(true)
  }

  const handleUpdateQuantity = (item: OrderItem, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(item)
      return
    }

    setCartItems((prevItems) =>
      prevItems.map((prevItem) => (prevItem.product_id === item.product_id ? { ...prevItem, quantity } : prevItem)),
    )
  }

  const handleRemoveItem = (item: OrderItem) => {
    setCartItems((prevItems) => prevItems.filter((prevItem) => prevItem.product_id !== item.product_id))
  }

  const handleCheckout = async (customerName: string, tableReference: string, orderDetails: string) => {
    try {
      // Asegurarse de que los precios sean números
      const totalAmount = cartItems.reduce((sum, item) => {
        const price = typeof item.price === "string" ? Number.parseFloat(item.price) : item.price
        return sum + price * item.quantity
      }, 0)

      const order: Order = {
        table_reference: tableReference,
        customer_name: customerName,
        status: "pending",
        total_amount: totalAmount,
        paid: false,
        details: orderDetails,
        items: cartItems.map((item) => {
          const price = typeof item.price === "string" ? Number.parseFloat(item.price) : item.price
          return {
            product_id: item.product_id,
            quantity: item.quantity,
            price: price,
            notes: "",
          }
        }),
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      })

      if (response.ok) {
        // Limpiar carrito y cerrar
        setCartItems([])
        setIsCartOpen(false)

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "¡Pedido creado!",
          text: "Tu pedido ha sido creado con éxito",
          timer: 1500,
          showConfirmButton: false,
        })

        return true
      } else {
        const error = await response.json()
        throw new Error(error.message || "Error desconocido")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  }

  // Filtrar productos por categoría y término de búsqueda
  const filteredProducts = Array.isArray(products)
    ? products.filter((product) => {
        const matchesCategory = selectedCategory ? product.category === selectedCategory : true
        const matchesSearch =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
        return matchesCategory && matchesSearch
      })
    : []

  // Calcular el número de items en el carrito
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      <DatabaseInitializer />
      <Header />
      <main className="main-content">
        <div className="container">
          <div className="card">
            <h1 className="card-title">Menú</h1>

            <div className="search-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="category-filter">
              <button
                className={`category-btn ${selectedCategory === null ? "active" : ""}`}
                onClick={() => setSelectedCategory(null)}
              >
                Todos
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? "active" : ""}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="empty-state">
                <p className="empty-state-message">Cargando productos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-message">No se encontraron productos</p>
                <p className="empty-state-description">Intenta con otra búsqueda o categoría</p>
              </div>
            ) : (
              <div className="grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                ))}
              </div>
            )}
          </div>
        </div>

        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
          tables={tables}
        />

        <button className="btn btn-primary cart-button" onClick={() => setIsCartOpen(true)}>
          <i className="icon-cart"></i>
          {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
        </button>
      </main>
    </>
  )
}
