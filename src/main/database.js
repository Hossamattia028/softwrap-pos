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
    // Check if image_path column exists in products, if not add it
    try {
      const productsInfo = this.db.prepare("PRAGMA table_info(products)").all();
      const hasImagePath = productsInfo.some(col => col.name === 'image_path');
      
      if (!hasImagePath) {
        console.log('Adding image_path column to products table...');
        this.db.exec('ALTER TABLE products ADD COLUMN image_path TEXT');
        console.log('Migration completed successfully');
      }
    } catch (error) {
      console.error('Products migration error:', error);
    }

    // Check and fix orders table columns
    try {
      const ordersInfo = this.db.prepare("PRAGMA table_info(orders)").all();
      const hasTax = ordersInfo.some(col => col.name === 'tax');
      const hasDiscount = ordersInfo.some(col => col.name === 'discount');
      const hasShipping = ordersInfo.some(col => col.name === 'shipping');
      const hasPaymentMethod = ordersInfo.some(col => col.name === 'payment_method');
      
      if (!hasTax) {
        console.log('Adding tax column to orders table...');
        this.db.exec('ALTER TABLE orders ADD COLUMN tax REAL DEFAULT 0');
      }
      if (!hasDiscount) {
        console.log('Adding discount column to orders table...');
        this.db.exec('ALTER TABLE orders ADD COLUMN discount REAL DEFAULT 0');
      }
      if (!hasShipping) {
        console.log('Adding shipping column to orders table...');
        this.db.exec('ALTER TABLE orders ADD COLUMN shipping REAL DEFAULT 0');
      }
      if (!hasPaymentMethod) {
        console.log('Adding payment_method column to orders table...');
        this.db.exec('ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT "cash"');
        this.db.exec('ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT "paid"');
      }
      console.log('Orders table migration completed');
    } catch (error) {
      console.error('Orders migration error:', error);
    }

    // Check and fix expenses table columns
    try {
      const expensesInfo = this.db.prepare("PRAGMA table_info(expenses)").all();
      const hasExpenseDate = expensesInfo.some(col => col.name === 'expense_date');
      
      if (!hasExpenseDate) {
        console.log('Adding expense_date column to expenses table...');
        this.db.exec('ALTER TABLE expenses ADD COLUMN expense_date TEXT DEFAULT CURRENT_DATE');
      }
      console.log('Expenses table migration completed');
    } catch (error) {
      console.error('Expenses migration error:', error);
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
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'completed',
        subtotal REAL NOT NULL,
        discount REAL DEFAULT 0,
        shipping REAL DEFAULT 0,
        tax REAL DEFAULT 0,
        total REAL NOT NULL,
        customer_name TEXT,
        customer_phone TEXT,
        customer_email TEXT,
        notes TEXT,
        payment_method TEXT DEFAULT 'cash',
        payment_status TEXT DEFAULT 'paid',
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
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        subtotal REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
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
        expense_date TEXT DEFAULT CURRENT_DATE,
        notes TEXT,
        paid_by TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (paid_by) REFERENCES users(id)
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
        { sku: 'PROD001', name: 'Laptop Dell XPS 13', price: 4500, cost_price: 3500, stock: 10, category: 'Electronics', description: 'High-performance laptop with 13" display' },
        { sku: 'PROD002', name: 'Wireless Mouse Logitech', price: 120, cost_price: 80, stock: 50, category: 'Electronics', description: 'Ergonomic wireless mouse' },
        { sku: 'PROD003', name: 'USB-C Cable 2m', price: 45, cost_price: 25, stock: 100, category: 'Accessories', description: 'Fast charging USB-C cable' },
        { sku: 'PROD004', name: 'Notebook A4 80 Sheets', price: 15, cost_price: 8, stock: 200, category: 'Stationery', description: 'Quality notebook for notes' },
        { sku: 'PROD005', name: 'Pen Set (5 pcs)', price: 25, cost_price: 12, stock: 150, category: 'Stationery', description: 'Blue ink pen set' },
        { sku: 'PROD006', name: 'Keyboard Mechanical RGB', price: 350, cost_price: 250, stock: 25, category: 'Electronics', description: 'Gaming mechanical keyboard' },
        { sku: 'PROD007', name: 'Webcam HD 1080p', price: 280, cost_price: 200, stock: 30, category: 'Electronics', description: 'Full HD webcam' },
        { sku: 'PROD008', name: 'USB Flash Drive 32GB', price: 60, cost_price: 40, stock: 80, category: 'Accessories', description: 'Fast USB 3.0 drive' },
        { sku: 'PROD009', name: 'Phone Case iPhone', price: 85, cost_price: 50, stock: 60, category: 'Accessories', description: 'Protective phone case' },
        { sku: 'PROD010', name: 'Headphones Wireless', price: 220, cost_price: 150, stock: 40, category: 'Electronics', description: 'Bluetooth headphones' }
      ];

      const insertProduct = this.db.prepare(`
        INSERT INTO products (id, sku, name, description, price, cost_price, stock_quantity, category, tax_rate, unit)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 15, 'pcs')
      `);

      sampleProducts.forEach(p => {
        insertProduct.run(uuidv4(), p.sku, p.name, p.description, p.price, p.cost_price, p.stock, p.category);
      });
    }

    // Sample staff user
    const staffExists = this.db.prepare('SELECT id FROM users WHERE username = ?').get('staff');
    if (!staffExists) {
      const passwordHash = bcrypt.hashSync('staff123', 10);
      this.db.prepare(`
        INSERT INTO users (id, username, password_hash, role, display_name)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), 'staff', passwordHash, 'staff', 'Staff Member');
    }

    // Sample orders
    const orderExists = this.db.prepare('SELECT id FROM orders LIMIT 1').get();
    const adminUser = this.db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
    if (!orderExists && adminUser) {
      const products = this.db.prepare('SELECT id, name, price FROM products LIMIT 5').all();
      if (products.length > 0) {
        // Create 3 sample orders
        for (let i = 1; i <= 3; i++) {
          const orderId = uuidv4();
          const orderNumber = `ORD-${Date.now()}-${i}`;
          const subtotal = products[0].price * 2;
          const tax = subtotal * 0.15;
          const total = subtotal + tax;

          this.db.prepare(`
            INSERT INTO orders (
              id, order_number, customer_name, subtotal, tax, total, 
              payment_method, payment_status, status, user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            orderId,
            orderNumber,
            `Customer ${i}`,
            subtotal,
            tax,
            total,
            'cash',
            'paid',
            'completed',
            adminUser.id
          );

          // Add order items
          this.db.prepare(`
            INSERT INTO order_items (id, order_id, product_id, product_name, quantity, price, subtotal)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(
            uuidv4(),
            orderId,
            products[0].id,
            products[0].name,
            2,
            products[0].price,
            products[0].price * 2
          );
        }
      }
    }

    // Sample expenses
    const expenseExists = this.db.prepare('SELECT id FROM expenses LIMIT 1').get();
    if (!expenseExists && adminUser) {
      const sampleExpenses = [
        { title: 'Office Rent', amount: 2000, category: 'Rent' },
        { title: 'Electricity Bill', amount: 350, category: 'Utilities' },
        { title: 'Internet Service', amount: 250, category: 'Utilities' },
        { title: 'Office Supplies', amount: 180, category: 'Supplies' }
      ];

      const insertExpense = this.db.prepare(`
        INSERT INTO expenses (id, title, category, amount, expense_date, paid_by)
        VALUES (?, ?, ?, ?, date('now'), ?)
      `);

      sampleExpenses.forEach(e => {
        insertExpense.run(uuidv4(), e.title, e.category, e.amount, adminUser.id);
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

