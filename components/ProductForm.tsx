"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Product } from "@/lib/models"
import Swal from "sweetalert2"

interface ProductFormProps {
  product?: Product
  onSubmit: (product: Product) => void
  onCancel: () => void
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>({
    id: product?.id || 0,
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    category: product?.category || "",
    image_url: product?.image_url || "",
  })

  const [categories, setCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "price") {
      // Validar que sea un número válido
      const numValue = Number.parseFloat(value)
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    // Limpiar error si el campo tiene valor
    if (value.trim() !== "") {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validar campos requeridos
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (!formData.category.trim()) {
      newErrors.category = "La categoría es requerida"
    }

    if (formData.price <= 0) {
      newErrors.price = "El precio debe ser mayor que 0"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setErrors((prev) => ({
        ...prev,
        newCategory: "El nombre de la categoría es requerido",
      }))
      return
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category: newCategory }),
      })

      if (response.ok) {
        await fetchCategories()
        setFormData((prev) => ({
          ...prev,
          category: newCategory,
        }))
        setNewCategory("")
        setShowNewCategoryInput(false)
      } else {
        const error = await response.json()
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Error al crear la categoría: ${error.message || error.error || "Error desconocido"}`,
        })
      }
    } catch (error) {
      console.error("Error creating category:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al crear la categoría",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Nombre *
        </label>
        <input type="text" id="name" name="name" className="form-input" value={formData.name} onChange={handleChange} />
        {errors.name && <p className="error-message">{errors.name}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          className="form-input"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="price" className="form-label">
          Precio *
        </label>
        <input
          type="number"
          id="price"
          name="price"
          className="form-input"
          value={formData.price}
          onChange={handleChange}
          step="0.01"
          min="0"
        />
        {errors.price && <p className="error-message">{errors.price}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="category" className="form-label">
          Categoría *
        </label>
        {!showNewCategoryInput ? (
          <div className="category-selection">
            <select
              id="category"
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-outline" onClick={() => setShowNewCategoryInput(true)}>
              Nueva
            </button>
          </div>
        ) : (
          <div className="new-category-input">
            <input
              type="text"
              className="form-input"
              value={newCategory}
              onChange={(e) => {
                setNewCategory(e.target.value)
                if (e.target.value.trim() !== "") {
                  setErrors((prev) => ({
                    ...prev,
                    newCategory: "",
                  }))
                }
              }}
              placeholder="Nombre de la nueva categoría"
            />
            <div className="button-group">
              <button type="button" className="btn btn-primary" onClick={handleAddCategory}>
                Añadir
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setShowNewCategoryInput(false)
                  setNewCategory("")
                }}
              >
                Cancelar
              </button>
            </div>
            {errors.newCategory && <p className="error-message">{errors.newCategory}</p>}
          </div>
        )}
        {errors.category && <p className="error-message">{errors.category}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="image_url" className="form-label">
          URL de la imagen
        </label>
        <input
          type="text"
          id="image_url"
          name="image_url"
          className="form-input"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          {product ? "Actualizar Producto" : "Crear Producto"}
        </button>
      </div>
    </form>
  )
}
