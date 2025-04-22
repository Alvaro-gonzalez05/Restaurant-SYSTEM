"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import ProductTable from "@/components/ProductTable"
import ProductForm from "@/components/ProductForm"
import DatabaseInitializer from "@/components/DatabaseInitializer"
import type { Product } from "@/lib/models"
import Swal from "sweetalert2"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | undefined>(undefined)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    // Conectar al servidor WebSocket
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("Conectado al servidor WebSocket desde Productos");
    };

    socket.onmessage = (event) => {
      console.log("Mensaje recibido desde WebSocket en Productos:", event.data);
    };

    socket.onclose = () => {
      console.log("Desconectado del servidor WebSocket desde Productos");
    };

    return () => {
      socket.close();
    };
  }, []);

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
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([]) // Establecer un array vacío en caso de error
      setIsLoading(false)
    }
  }

  const handleCreateProduct = () => {
    setCurrentProduct(undefined)
    setIsEditing(false)
    setShowForm(true)
  }

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product)
    setIsEditing(true)
    setShowForm(true)
  }

  const handleDeleteProduct = async (productId: number) => {
    try {
      const response = await fetch(`/api/products?id=${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Actualizar la lista de productos
        setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId))
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Producto eliminado con éxito",
          timer: 1500,
          showConfirmButton: false,
        })
      } else {
        const error = await response.json()
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Error al eliminar el producto: ${error.message || error.error || "Error desconocido"}`,
        })
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al eliminar el producto",
      })
    }
  }

  const handleSubmitProduct = async (product: Product) => {
    try {
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch("/api/products", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })

      if (response.ok) {
        const savedProduct = await response.json()

        if (isEditing) {
          // Actualizar el producto existente
          setProducts((prevProducts) => prevProducts.map((p) => (p.id === savedProduct.id ? savedProduct : p)))
        } else {
          // Añadir el nuevo producto
          setProducts((prevProducts) => [...prevProducts, savedProduct])
        }

        setShowForm(false)
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: isEditing ? "Producto actualizado con éxito" : "Producto creado con éxito",
          timer: 1500,
          showConfirmButton: false,
        })
      } else {
        const error = await response.json()
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Error al ${isEditing ? "actualizar" : "crear"} el producto: ${error.message || error.error || "Error desconocido"}`,
        })
      }
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "creating"} product:`, error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error al ${isEditing ? "actualizar" : "crear"} el producto`,
      })
    }
  }

  return (
    <>
      <DatabaseInitializer />
      <Header />
      <main className="main-content">
        <div className="container">
          <div className="card">
            <div className="card-header">
              <h1 className="card-title">Gestión de Productos</h1>
              {!showForm && (
                <button className="btn btn-primary" onClick={handleCreateProduct}>
                  Nuevo Producto
                </button>
              )}
            </div>

            {showForm ? (
              <div className="product-form-container">
                <h2>{isEditing ? "Editar Producto" : "Nuevo Producto"}</h2>
                <ProductForm
                  product={currentProduct}
                  onSubmit={handleSubmitProduct}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            ) : isLoading ? (
              <div className="empty-state">
                <p className="empty-state-message">Cargando productos...</p>
              </div>
            ) : (
              <ProductTable products={products} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />
            )}
          </div>
        </div>
      </main>
    </>
  )
}
