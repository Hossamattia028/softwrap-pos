const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const os = require('os');
const Database = require('../main/database');
const BackupManager = require('../main/backup');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup data directory for web version
const userDataPath = process.env.DB_PATH || path.join(os.homedir(), '.softwrap-pos-web');
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

const dbPath = path.join(userDataPath, 'database.db');

// Initialize database
const db = new Database(dbPath);
db.initialize();

const backupManager = new BackupManager(db, userDataPath);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session management
app.use(session({
  secret: process.env.SESSION_SECRET || 'softwrap-pos-secret-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../renderer')));
app.use('/assets', express.static(path.join(__dirname, '../../assets')));

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  next();
};

// Routes

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const bcrypt = require('bcrypt');
    
    const user = db.getDb().prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);
    
    if (!user) {
      return res.json({ success: false, message: 'Invalid username or password' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    
    if (match) {
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;
      
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          display_name: user.display_name
        }
      });
    } else {
      res.json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Get current user
app.get('/api/current-user', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.session.userId,
      username: req.session.username,
      role: req.session.role
    }
  });
});

// Products
app.get('/api/products', requireAuth, async (req, res) => {
  try {
    const products = db.getDb().prepare('SELECT * FROM products WHERE is_active = 1 ORDER BY name').all();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/products', requireAuth, async (req, res) => {
  try {
    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();
    const productData = req.body;
    
    db.getDb().prepare(`
      INSERT INTO products (id, sku, name, description, price, cost_price, tax_rate, stock_quantity, unit, category, image_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      productData.sku,
      productData.name,
      productData.description || '',
      productData.price,
      productData.cost_price || 0,
      productData.tax_rate || 0,
      productData.stock_quantity || 0,
      productData.unit || 'pcs',
      productData.category || '',
      productData.image_path || ''
    );
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/products/:id', requireAuth, async (req, res) => {
  try {
    const productData = req.body;
    db.getDb().prepare(`
      UPDATE products 
      SET sku = ?, name = ?, description = ?, price = ?, cost_price = ?, 
          tax_rate = ?, stock_quantity = ?, unit = ?, category = ?, image_path = ?
      WHERE id = ?
    `).run(
      productData.sku,
      productData.name,
      productData.description,
      productData.price,
      productData.cost_price,
      productData.tax_rate,
      productData.stock_quantity,
      productData.unit,
      productData.category,
      productData.image_path || '',
      req.params.id
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/products/:id', requireAuth, async (req, res) => {
  try {
    db.getDb().prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Orders
app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const orders = db.getDb().prepare(`
      SELECT o.*, u.username as user_name 
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 100
    `).all();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/orders', requireAuth, async (req, res) => {
  try {
    const { v4: uuidv4 } = require('uuid');
    const orderData = req.body;
    const orderId = uuidv4();
    const orderNumber = 'ORD-' + Date.now();
    
    // Calculate totals
    const subtotal = parseFloat(orderData.subtotal) || 0;
    const discount = parseFloat(orderData.discount) || 0;
    const shipping = parseFloat(orderData.shipping) || 0;
    const tax = parseFloat(orderData.tax) || 0;
    const total = subtotal - discount + shipping + tax;
    
    // Insert order
    db.getDb().prepare(`
      INSERT INTO orders (
        id, order_number, customer_name, customer_phone, customer_email,
        subtotal, discount, shipping, tax, total, payment_method, payment_status,
        notes, user_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      orderNumber,
      orderData.customer_name || '',
      orderData.customer_phone || '',
      orderData.customer_email || '',
      subtotal,
      discount,
      shipping,
      tax,
      total,
      orderData.payment_method || 'cash',
      'paid',
      orderData.notes || '',
      req.session.userId,
      'completed'
    );
    
    // Insert order items
    if (orderData.items && Array.isArray(orderData.items)) {
      const itemStmt = db.getDb().prepare(`
        INSERT INTO order_items (
          id, order_id, product_id, product_name, quantity, price, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const item of orderData.items) {
        itemStmt.run(
          uuidv4(),
          orderId,
          item.product_id,
          item.product_name,
          item.quantity,
          item.price,
          item.quantity * item.price
        );
        
        // Update product stock
        db.getDb().prepare(`
          UPDATE products 
          SET stock_quantity = stock_quantity - ? 
          WHERE id = ?
        `).run(item.quantity, item.product_id);
      }
    }
    
    res.json({ success: true, orderId, orderNumber });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/orders/:id', requireAuth, async (req, res) => {
  try {
    const order = db.getDb().prepare(`
      SELECT o.*, u.username as user_name 
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `).get(req.params.id);
    
    if (order) {
      const items = db.getDb().prepare(`
        SELECT * FROM order_items WHERE order_id = ?
      `).all(req.params.id);
      order.items = items;
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Expenses
app.get('/api/expenses', requireAuth, async (req, res) => {
  try {
    const expenses = db.getDb().prepare(`
      SELECT e.*, u.username as paid_by_name
      FROM expenses e
      LEFT JOIN users u ON e.paid_by = u.id
      ORDER BY e.expense_date DESC
    `).all();
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/expenses', requireAuth, async (req, res) => {
  try {
    const { v4: uuidv4 } = require('uuid');
    const expenseData = req.body;
    const id = uuidv4();
    
    db.getDb().prepare(`
      INSERT INTO expenses (id, title, category, amount, expense_date, paid_by, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      expenseData.title,
      expenseData.category || 'General',
      expenseData.amount,
      expenseData.expense_date || new Date().toISOString().split('T')[0],
      req.session.userId,
      expenseData.notes || ''
    );
    
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reports
app.post('/api/reports/generate', requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    // Sales report
    const orders = db.getDb().prepare(`
      SELECT * FROM orders 
      WHERE date(created_at) BETWEEN ? AND ?
    `).all(startDate, endDate);
    
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Top products
    const topProducts = db.getDb().prepare(`
      SELECT 
        oi.product_name,
        p.sku,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE date(o.created_at) BETWEEN ? AND ?
      GROUP BY oi.product_id, oi.product_name, p.sku
      ORDER BY total_sold DESC
      LIMIT 10
    `).all(startDate, endDate);
    
    // Expenses in period
    const expenses = db.getDb().prepare(`
      SELECT SUM(amount) as total 
      FROM expenses 
      WHERE date(expense_date) BETWEEN ? AND ?
    `).get(startDate, endDate);
    
    const totalExpenses = expenses?.total || 0;
    const grossProfit = totalRevenue - totalExpenses;
    
    res.json({
      success: true,
      report: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        totalExpenses,
        grossProfit,
        topProducts,
        startDate,
        endDate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Settings
app.get('/api/settings', requireAuth, async (req, res) => {
  try {
    const settings = db.getDb().prepare('SELECT * FROM settings').all();
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    res.json({ success: true, settings: settingsObj });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/settings', requireAuth, async (req, res) => {
  try {
    const settingsData = req.body;
    const stmt = db.getDb().prepare(`
      INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
    `);
    
    for (const [key, value] of Object.entries(settingsData)) {
      stmt.run(key, value);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Users (admin only)
app.get('/api/users', requireAuth, async (req, res) => {
  try {
    if (req.session.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    const users = db.getDb().prepare(`
      SELECT id, username, display_name, role, is_active, created_at 
      FROM users 
      ORDER BY created_at DESC
    `).all();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/users', requireAuth, async (req, res) => {
  try {
    if (req.session.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    
    const { v4: uuidv4 } = require('uuid');
    const bcrypt = require('bcrypt');
    const userData = req.body;
    const id = uuidv4();
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    db.getDb().prepare(`
      INSERT INTO users (id, username, password_hash, display_name, role, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(
      id,
      userData.username,
      passwordHash,
      userData.display_name || userData.username,
      userData.role || 'staff'
    );
    
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/users/:id/password', requireAuth, async (req, res) => {
  try {
    // Users can change their own password, admins can change anyone's
    if (req.session.userId !== req.params.id && req.session.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(req.body.newPassword, 10);
    
    db.getDb().prepare(`
      UPDATE users SET password_hash = ? WHERE id = ?
    `).run(passwordHash, req.params.id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Backup
app.post('/api/backup/create', requireAuth, async (req, res) => {
  try {
    if (req.session.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    const result = await backupManager.createBackup();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/backup/list', requireAuth, async (req, res) => {
  try {
    const result = await backupManager.listBackups();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve the main app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../renderer/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          🛒 Softwrap POS Web Server Started! 🛒          ║
║                                                            ║
║  Server running at: http://localhost:${PORT}              ║
║                                                            ║
║  Default Login:                                            ║
║    Username: admin                                         ║
║    Password: admin123                                      ║
║                                                            ║
║  Press Ctrl+C to stop the server                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Server shutting down...');
  db.close();
  process.exit(0);
});

