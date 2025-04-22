"use client"

import { useState } from "react"
import type { Product } from "@/lib/models"
import Swal from "sweetalert2"

interface ProductTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: number) => void
}

export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Obtener categorías únicas
  const categories = Array.from(new Set(products.map((product) => product.category)))
    .filter(Boolean)
    .sort()

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="product-table-container">
      <div className="product-table-filters">
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
            Todas
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
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-message">No se encontraron productos</p>
          <p className="empty-state-description">Intenta con otra búsqueda o categoría</p>
        </div>
      ) : (
        <div className="product-table">
          <div className="product-table-header">
            <div className="product-cell product-name-cell">Nombre</div>
            <div className="product-cell product-description-cell">Descripción</div>
            <div className="product-cell product-price-cell">Precio</div>
            <div className="product-cell product-category-cell">Categoría</div>
            <div className="product-cell product-actions-cell">Acciones</div>
          </div>

          <div className="product-table-body">
            {filteredProducts.map((product) => {
              // Asegurarse de que el precio sea un número
              const price = typeof product.price === "string" ? Number.parseFloat(product.price) : product.price

              return (
                <div key={product.id} className="product-row">
                  <div className="product-cell product-name-cell">{product.name}</div>
                  <div className="product-cell product-description-cell">{product.description || "-"}</div>
                  <div className="product-cell product-price-cell">${price.toFixed(2)}</div>
                  <div className="product-cell product-category-cell">{product.category}</div>
                  <div className="product-cell product-actions-cell">
                    <button className="btn btn-outline btn-sm" onClick={() => onEdit(product)}>
                      Editar
                    </button>
                    <button
                      className="btn btn-outline btn-sm btn-danger"
                      onClick={() => {
                        Swal.fire({
                          title: "¿Estás seguro?",
                          text: `¿Deseas eliminar el producto "${product.name}"?`,
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#ef5350",
                          cancelButtonColor: "#757575",
                          confirmButtonText: "Sí, eliminar",
                          cancelButtonText: "Cancelar",
                        }).then((result) => {
                          if (result.isConfirmed) {
                            onDelete(product.id)
                          }
                        })
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
