const Database = require('better-sqlite3');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

class PosDatabase {
  constructor(dbPath) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
  }

  initialize() {
    this.createTables();
    this.migrateDatabase();
    this.seedDefaultData();
  }

  migrateDatabase() {
    // Check if image_path column exists, if not add it
    try {
      const tableInfo = this.db.prepare("PRAGMA table_info(products)").all();
      const hasImagePath = tableInfo.some(col => col.name === 'image_path');
      
      if (!hasImagePath) {
        console.log('Adding image_path column to products table...');
        this.db.exec('ALTER TABLE products ADD COLUMN image_path TEXT');
        console.log('Migration completed successfully');
      }
    } catch (error) {
      console.error('Migration error:', error);
    }
  }

  createTables() {
    // Products table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        sku TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        cost_price REAL DEFAULT 0,
        tax_rate REAL DEFAULT 0,
        stock_quantity INTEGER DEFAULT 0,
        unit TEXT DEFAULT 'pcs',
        category TEXT,
        image_path TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        order_number TEXT UNIQUE NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'paid',
        subtotal REAL NOT NULL,
        tax_total REAL DEFAULT 0,
        discount_total REAL DEFAULT 0,
        shipping_cost REAL DEFAULT 0,
        total REAL NOT NULL,
        customer_name TEXT,
        customer_phone TEXT,
        customer_email TEXT,
        notes TEXT,
        user_id TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Order items table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        product_sku TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        discount REAL DEFAULT 0,
        tax REAL DEFAULT 0,
        total REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Payments table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        amount REAL NOT NULL,
        method TEXT NOT NULL,
        reference TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    // Expenses table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        paid_by TEXT,
        user_id TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'cashier',
        display_name TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

    // Audit log table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Stock adjustments table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS stock_adjustments (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        quantity_change INTEGER NOT NULL,
        reason TEXT,
        notes TEXT,
        user_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
      CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
      CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
      CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
      CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
      CREATE INDEX IF NOT EXISTS idx_expenses_created ON expenses(created_at);
    `);
  }

  seedDefaultData() {
    // Check if admin user exists
    const adminExists = this.db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
    
    if (!adminExists) {
      const passwordHash = bcrypt.hashSync('admin123', 10);
      this.db.prepare(`
        INSERT INTO users (id, username, password_hash, role, display_name)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), 'admin', passwordHash, 'admin', 'Administrator');
    }

    // Default settings
    const settings = [
      ['store_name', 'Softwrap POS'],
      ['store_phone', ''],
      ['store_email', ''],
      ['store_address', ''],
      ['tax_number', ''],
      ['default_tax_rate', '15'],
      ['currency_symbol', 'EGP'],
      ['backup_interval', '60'],
      ['low_stock_threshold', '10'],
      ['receipt_header', 'Thank you for your business!'],
      ['receipt_footer', 'Visit us again!']
    ];

    const insertSetting = this.db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
    settings.forEach(([key, value]) => insertSetting.run(key, value));

    // Sample products
    const productExists = this.db.prepare('SELECT id FROM products LIMIT 1').get();
    if (!productExists) {
      const sampleProducts = [
        { sku: 'PROD001', name: 'Laptop Dell XPS 13', price: 4500, cost_price: 3500, stock: 10, category: 'Electronics' },
        { sku: 'PROD002', name: 'Wireless Mouse', price: 120, cost_price: 80, stock: 50, category: 'Electronics' },
        { sku: 'PROD003', name: 'USB-C Cable', price: 45, cost_price: 25, stock: 100, category: 'Accessories' },
        { sku: 'PROD004', name: 'Notebook A4', price: 15, cost_price: 8, stock: 200, category: 'Stationery' },
        { sku: 'PROD005', name: 'Pen Set', price: 25, cost_price: 12, stock: 150, category: 'Stationery' }
      ];

      const insertProduct = this.db.prepare(`
        INSERT INTO products (id, sku, name, price, cost_price, stock_quantity, category, tax_rate)
        VALUES (?, ?, ?, ?, ?, ?, ?, 15)
      `);

      sampleProducts.forEach(p => {
        insertProduct.run(uuidv4(), p.sku, p.name, p.price, p.cost_price, p.stock, p.category);
      });
    }
  }

  close() {
    this.db.close();
  }

  getDb() {
    return this.db;
  }
}

module.exports = PosDatabase;

