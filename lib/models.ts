export interface Product {
  id: number
  name: string
  description: string
  price: number | string
  category: string
  image_url?: string
}

export interface Table {
  id: number
  number: number
  capacity: number
  status: "available" | "occupied" | "reserved"
}

export interface OrderItem {
  id?: number
  order_id?: number
  product_id: number
  product?: Product
  quantity: number
  price: number | string
  notes?: string
}

export interface Order {
  id?: number
  table_id?: number
  table_reference: string
  customer_name: string
  status: "pending" | "preparing" | "ready" | "delivered" | "completed"
  created_at?: string
  updated_at?: string
  total_amount: number | string
  payment_method?: "cash" | "card" | "mercado_pago"
  paid: boolean
  items: OrderItem[]
  details?: string
}

export interface DashboardMetrics {
  totalSales: number
  ordersCompleted: number
  pendingOrders: number
  averageOrderValue: number
}
