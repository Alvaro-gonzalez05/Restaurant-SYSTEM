"use client"

import type { Product } from "@/lib/models"

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // Asegurarse de que el precio sea un número
  const price = typeof product.price === "string" ? Number.parseFloat(product.price) : product.price

  return (
    <div className="product-card" onClick={() => onAddToCart(product)}>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <p className="product-price">${price.toFixed(2)}</p>
      </div>
    </div>
  )
}
