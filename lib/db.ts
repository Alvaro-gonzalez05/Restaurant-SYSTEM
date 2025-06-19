import { neon } from "@neondatabase/serverless"

// Obtener la cadena de conexión
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!connectionString) {
  throw new Error("Database connection string not found. Please set DATABASE_URL or POSTGRES_URL environment variable.")
}

// Crear una instancia de SQL usando el método HTTP directo (no WebSocket)
const sql = neon(connectionString)

// Función para ejecutar consultas SQL
export async function query(text: string, params?: any[]) {
  try {
    if (params) {
      // Usar SQL tagged template para parámetros
      const paramPlaceholders = params.map((_, i) => `$${i + 1}`).join(", ")
      const queryText = text.replace("?", paramPlaceholders)
      return await sql.query(queryText, params)
    } else {
      return await sql.query(text)
    }
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Inicializar la base de datos con las tablas necesarias
export async function initializeDatabase() {
  try {
    // Verificar la conexión a la base de datos
    console.log("Checking database connection...")
    const result = await sql`SELECT NOW()`
    console.log("Database connection successful:", result[0])

    // Crear tabla de productos (menú)
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100),
        image_url TEXT
      )
    `

    // Crear tabla de mesas
    await sql`
      CREATE TABLE IF NOT EXISTS tables (
        id SERIAL PRIMARY KEY,
        number INT NOT NULL UNIQUE,
        capacity INT NOT NULL,
        status VARCHAR(50) DEFAULT 'available'
      )
    `

    // Crear tabla de órdenes con los nuevos campos
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        table_id INT REFERENCES tables(id),
        table_reference VARCHAR(255),
        customer_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_amount DECIMAL(10, 2) DEFAULT 0,
        payment_method VARCHAR(50),
        paid BOOLEAN DEFAULT FALSE,
        details TEXT
      )
    `

    // Verificar si la columna table_reference existe, si no, agregarla
    try {
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_reference VARCHAR(255)`
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS details TEXT`
    } catch (error) {
      console.log("Columns already exist or error adding them:", error)
    }

    // Crear tabla de items de órdenes
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id),
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        notes TEXT
      )
    `

    // Verificar si existen productos
    const productsExist = await sql`SELECT COUNT(*) FROM products`
    const productsCount = Number.parseInt(productsExist[0].count)
    console.log("Products count:", productsCount)

    if (productsCount === 0) {
      console.log("Inserting sample products...")
      await sql`
        INSERT INTO products (name, description, price, category) VALUES
        ('Pizza Margherita', 'Tomate, mozzarella y albahaca', 10.99, 'Pizzas'),
        ('Pizza Pepperoni', 'Tomate, mozzarella y pepperoni', 12.99, 'Pizzas'),
        ('Ensalada César', 'Lechuga, pollo, crutones y aderezo césar', 8.99, 'Ensaladas'),
        ('Pasta Carbonara', 'Espaguetis con salsa carbonara', 11.99, 'Pastas'),
        ('Agua Mineral', 'Botella de 500ml', 1.99, 'Bebidas'),
        ('Refresco', 'Coca-Cola, Fanta o Sprite', 2.49, 'Bebidas'),
        ('Tiramisú', 'Postre italiano con café y mascarpone', 5.99, 'Postres'),
        ('Hamburguesa Clásica', 'Carne, lechuga, tomate y queso', 9.99, 'Hamburguesas'),
        ('Patatas Fritas', 'Porción grande con salsa', 3.99, 'Acompañamientos')
      `
      console.log("Sample products inserted successfully")
    }

    // Verificar si existen mesas
    const tablesExist = await sql`SELECT COUNT(*) FROM tables`
    const tablesCount = Number.parseInt(tablesExist[0].count)
    console.log("Tables count:", tablesCount)

    if (tablesCount === 0) {
      console.log("Inserting sample tables...")
      await sql`
        INSERT INTO tables (number, capacity, status) VALUES
        (1, 4, 'available'),
        (2, 2, 'available'),
        (3, 6, 'available'),
        (4, 4, 'available'),
        (5, 8, 'available'),
        (6, 2, 'available')
      `
      console.log("Sample tables inserted successfully")
    }

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}

// Exportar la instancia de SQL para uso directo
export { sql }
