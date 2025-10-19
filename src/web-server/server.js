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
    const orders = await db.getAllOrders();
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/orders', requireAuth, async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      userId: req.session.userId
    };
    const result = await db.createOrder(orderData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/orders/:id', requireAuth, async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.id);
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Expenses
app.get('/api/expenses', requireAuth, async (req, res) => {
  try {
    const expenses = await db.getAllExpenses();
    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/expenses', requireAuth, async (req, res) => {
  try {
    const expenseData = {
      ...req.body,
      userId: req.session.userId
    };
    const result = await db.createExpense(expenseData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reports
app.post('/api/reports/generate', requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const report = await db.generateReport(startDate, endDate);
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Settings
app.get('/api/settings', requireAuth, async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/settings', requireAuth, async (req, res) => {
  try {
    const result = await db.updateSettings(req.body);
    res.json(result);
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
    const users = await db.getAllUsers();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/users', requireAuth, async (req, res) => {
  try {
    if (req.session.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    const result = await db.createUser(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/users/:id/password', requireAuth, async (req, res) => {
  try {
    // Users can change their own password, admins can change anyone's
    if (req.session.userId !== parseInt(req.params.id) && req.session.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const result = await db.changePassword(req.params.id, req.body.newPassword);
    res.json(result);
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

