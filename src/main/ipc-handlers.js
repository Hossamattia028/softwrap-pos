const { dialog } = require('electron');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const os = require('os');
const fs = require('fs');
const PDFGenerator = require('./pdf-generators');
const ThermalPrinter = require('./printer');

module.exports = function(ipcMain, db, backupManager, app) {
  
  // Authentication
  ipcMain.handle('auth:login', async (event, { username, password }) => {
    try {
      const user = db.getDb().prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);
      
      if (!user) {
        return { success: false, message: 'Invalid username or password' };
      }

      const match = await bcrypt.compare(password, user.password_hash);
      
      if (match) {
        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            display_name: user.display_name
          }
        };
      } else {
        return { success: false, message: 'Invalid username or password' };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Products
  ipcMain.handle('products:getAll', async () => {
    try {
      const products = db.getDb().prepare('SELECT * FROM products WHERE is_active = 1 ORDER BY name').all();
      return { success: true, data: products };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('products:search', async (event, query) => {
    try {
      const products = db.getDb().prepare(`
        SELECT * FROM products 
        WHERE is_active = 1 
        AND (name LIKE ? OR sku LIKE ? OR description LIKE ?)
        ORDER BY name
        LIMIT 50
      `).all(`%${query}%`, `%${query}%`, `%${query}%`);
      return { success: true, data: products };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('products:getById', async (event, id) => {
    try {
      const product = db.getDb().prepare('SELECT * FROM products WHERE id = ?').get(id);
      return { success: true, data: product };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('products:create', async (event, productData) => {
    try {
      const id = uuidv4();
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
      return { success: true, id };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('products:update', async (event, { id, productData }) => {
    try {
      db.getDb().prepare(`
        UPDATE products 
        SET sku = ?, name = ?, description = ?, price = ?, cost_price = ?, 
            tax_rate = ?, stock_quantity = ?, unit = ?, category = ?, image_path = ?, updated_at = CURRENT_TIMESTAMP
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
        id
      );
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('products:delete', async (event, id) => {
    try {
      db.getDb().prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(id);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('products:adjustStock', async (event, { productId, quantityChange, reason, notes, userId }) => {
    try {
      const transaction = db.getDb().transaction(() => {
        // Update product stock
        db.getDb().prepare('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?')
          .run(quantityChange, productId);
        
        // Log adjustment
        db.getDb().prepare(`
          INSERT INTO stock_adjustments (id, product_id, quantity_change, reason, notes, user_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), productId, quantityChange, reason, notes || '', userId);
      });
      
      transaction();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Orders
  ipcMain.handle('orders:create', async (event, orderData) => {
    try {
      const transaction = db.getDb().transaction(() => {
        const orderId = uuidv4();
        const orderNumber = `ORD-${Date.now()}`;
        
        // Insert order
        db.getDb().prepare(`
          INSERT INTO orders (id, order_number, subtotal, tax_total, discount_total, shipping_cost, total, 
                             customer_name, customer_phone, customer_email, notes, user_id, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          orderId,
          orderNumber,
          orderData.subtotal,
          orderData.tax_total,
          orderData.discount_total || 0,
          orderData.shipping_cost || 0,
          orderData.total,
          orderData.customer_name || '',
          orderData.customer_phone || '',
          orderData.customer_email || '',
          orderData.notes || '',
          orderData.user_id,
          'paid'
        );

        // Insert order items and update stock
        orderData.items.forEach(item => {
          const itemId = uuidv4();
          db.getDb().prepare(`
            INSERT INTO order_items (id, order_id, product_id, product_name, product_sku, quantity, unit_price, discount, tax, total)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            itemId,
            orderId,
            item.product_id,
            item.product_name,
            item.product_sku,
            item.quantity,
            item.unit_price,
            item.discount || 0,
            item.tax || 0,
            item.total
          );

          // Update stock
          db.getDb().prepare('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?')
            .run(item.quantity, item.product_id);
        });

        // Insert payments
        orderData.payments.forEach(payment => {
          const paymentId = uuidv4();
          db.getDb().prepare(`
            INSERT INTO payments (id, order_id, amount, method, reference)
            VALUES (?, ?, ?, ?, ?)
          `).run(paymentId, orderId, payment.amount, payment.method, payment.reference || '');
        });

        return { orderId, orderNumber };
      });

      const result = transaction();
      return { success: true, ...result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('orders:getAll', async (event, { limit = 100, offset = 0 } = {}) => {
    try {
      const orders = db.getDb().prepare(`
        SELECT * FROM orders 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `).all(limit, offset);
      return { success: true, data: orders };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('orders:getById', async (event, id) => {
    try {
      const order = db.getDb().prepare('SELECT * FROM orders WHERE id = ?').get(id);
      const items = db.getDb().prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
      const payments = db.getDb().prepare('SELECT * FROM payments WHERE order_id = ?').all(id);
      
      return { success: true, data: { ...order, items, payments } };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Expenses
  ipcMain.handle('expenses:create', async (event, expenseData) => {
    try {
      const id = uuidv4();
      db.getDb().prepare(`
        INSERT INTO expenses (id, title, amount, category, notes, paid_by, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        expenseData.title,
        expenseData.amount,
        expenseData.category || '',
        expenseData.notes || '',
        expenseData.paid_by || '',
        expenseData.user_id
      );
      return { success: true, id };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('expenses:getAll', async (event, { startDate, endDate } = {}) => {
    try {
      let query = 'SELECT * FROM expenses';
      const params = [];
      
      if (startDate && endDate) {
        query += ' WHERE created_at BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const expenses = db.getDb().prepare(query).all(...params);
      return { success: true, data: expenses };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Reports
  ipcMain.handle('reports:sales', async (event, { startDate, endDate }) => {
    try {
      const stats = db.getDb().prepare(`
        SELECT 
          COUNT(*) as total_orders,
          SUM(total) as total_revenue,
          SUM(tax_total) as total_tax,
          SUM(discount_total) as total_discounts,
          AVG(total) as average_order_value
        FROM orders
        WHERE created_at BETWEEN ? AND ?
        AND status = 'paid'
      `).get(startDate, endDate);

      const topProducts = db.getDb().prepare(`
        SELECT 
          oi.product_name,
          oi.product_sku,
          SUM(oi.quantity) as total_sold,
          SUM(oi.total) as revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at BETWEEN ? AND ?
        AND o.status = 'paid'
        GROUP BY oi.product_id
        ORDER BY total_sold DESC
        LIMIT 10
      `).all(startDate, endDate);

      return { success: true, data: { stats, topProducts } };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('reports:profit', async (event, { startDate, endDate }) => {
    try {
      const revenue = db.getDb().prepare(`
        SELECT SUM(total) as total FROM orders
        WHERE created_at BETWEEN ? AND ?
        AND status = 'paid'
      `).get(startDate, endDate);

      const cogs = db.getDb().prepare(`
        SELECT SUM(oi.quantity * p.cost_price) as total
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        WHERE o.created_at BETWEEN ? AND ?
        AND o.status = 'paid'
      `).get(startDate, endDate);

      const expenses = db.getDb().prepare(`
        SELECT SUM(amount) as total FROM expenses
        WHERE created_at BETWEEN ? AND ?
      `).get(startDate, endDate);

      const profit = (revenue.total || 0) - (cogs.total || 0) - (expenses.total || 0);

      return {
        success: true,
        data: {
          revenue: revenue.total || 0,
          cogs: cogs.total || 0,
          expenses: expenses.total || 0,
          profit
        }
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Settings
  ipcMain.handle('settings:getAll', async () => {
    try {
      const settings = db.getDb().prepare('SELECT * FROM settings').all();
      const settingsObj = {};
      settings.forEach(s => {
        settingsObj[s.key] = s.value;
      });
      return { success: true, data: settingsObj };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('settings:update', async (event, settingsData) => {
    try {
      const transaction = db.getDb().transaction(() => {
        Object.entries(settingsData).forEach(([key, value]) => {
          db.getDb().prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
            .run(key, value);
        });
      });
      
      transaction();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Backup
  ipcMain.handle('backup:create', async () => {
    try {
      const result = await backupManager.createBackup('manual');
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('backup:list', async () => {
    try {
      const backups = backupManager.listBackups();
      return { success: true, data: backups };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('backup:restore', async (event, backupPath) => {
    try {
      const result = await backupManager.restoreBackup(backupPath);
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('backup:export', async (event, backupName) => {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Export Backup',
        defaultPath: `${backupName}.zip`,
        filters: [{ name: 'Backup Files', extensions: ['zip'] }]
      });

      if (!result.canceled && result.filePath) {
        const exportResult = backupManager.exportBackup(backupName, result.filePath);
        return exportResult;
      }
      return { success: false, message: 'Export cancelled' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('backup:import', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Import Backup',
        filters: [{ name: 'Backup Files', extensions: ['zip'] }],
        properties: ['openFile']
      });

      if (!result.canceled && result.filePaths.length > 0) {
        const restoreResult = await backupManager.restoreBackup(result.filePaths[0]);
        return restoreResult;
      }
      return { success: false, message: 'Import cancelled' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Users
  ipcMain.handle('users:create', async (event, userData) => {
    try {
      const id = uuidv4();
      const passwordHash = await bcrypt.hash(userData.password, 10);
      
      db.getDb().prepare(`
        INSERT INTO users (id, username, password_hash, role, display_name)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, userData.username, passwordHash, userData.role, userData.display_name);
      
      return { success: true, id };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('users:getAll', async () => {
    try {
      const users = db.getDb().prepare('SELECT id, username, role, display_name, is_active, created_at FROM users').all();
      return { success: true, data: users };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Printing and PDF
  ipcMain.handle('print:generatePDF', async (event, { orderId, type }) => {
    try {
      const order = db.getDb().prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
      const items = db.getDb().prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
      const payments = db.getDb().prepare('SELECT * FROM payments WHERE order_id = ?').all(orderId);
      
      const orderData = { ...order, items, payments };
      
      const settings = db.getDb().prepare('SELECT * FROM settings').all();
      const settingsObj = {};
      settings.forEach(s => { settingsObj[s.key] = s.value; });

      const pdfGenerator = new PDFGenerator(settingsObj);
      const fileName = `${type}_${order.order_number}_${Date.now()}.pdf`;
      const downloadsPath = app.getPath('downloads');
      const filePath = path.join(downloadsPath, fileName);

      let result;
      if (type === 'invoice') {
        result = await pdfGenerator.generateInvoice(orderData, filePath);
      } else {
        result = await pdfGenerator.generateReceipt(orderData, filePath, false);
      }

      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('print:thermal', async (event, orderId) => {
    try {
      const order = db.getDb().prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
      const items = db.getDb().prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
      const payments = db.getDb().prepare('SELECT * FROM payments WHERE order_id = ?').all(orderId);
      
      const orderData = { ...order, items, payments };
      
      const settings = db.getDb().prepare('SELECT * FROM settings').all();
      const settingsObj = {};
      settings.forEach(s => { settingsObj[s.key] = s.value; });

      const printer = new ThermalPrinter();
      const result = await printer.printReceipt(orderData, settingsObj);
      
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('print:receipt', async (event, orderId) => {
    try {
      const order = db.getDb().prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
      const items = db.getDb().prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
      const payments = db.getDb().prepare('SELECT * FROM payments WHERE order_id = ?').all(orderId);
      
      const orderData = { ...order, items, payments };
      
      const settings = db.getDb().prepare('SELECT * FROM settings').all();
      const settingsObj = {};
      settings.forEach(s => { settingsObj[s.key] = s.value; });

      const pdfGenerator = new PDFGenerator(settingsObj);
      const fileName = `receipt_${order.order_number}_${Date.now()}.pdf`;
      const tempPath = path.join(os.tmpdir(), fileName);

      await pdfGenerator.generateReceipt(orderData, tempPath, true);

      // Use system print dialog
      const { shell } = require('electron');
      await shell.openPath(tempPath);

      return { success: true, path: tempPath };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // File operations for product images
  ipcMain.handle('file:selectImage', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Select Product Image',
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }
        ],
        properties: ['openFile']
      });

      if (!result.canceled && result.filePaths.length > 0) {
        const sourcePath = result.filePaths[0];
        const ext = path.extname(sourcePath);
        const fileName = `product_${Date.now()}${ext}`;
        const imagesDir = path.join(app.getPath('userData'), 'product-images');
        
        // Create images directory if it doesn't exist
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }
        
        const destPath = path.join(imagesDir, fileName);
        
        // Copy file to app data directory
        fs.copyFileSync(sourcePath, destPath);
        
        return { success: true, path: fileName };
      }
      
      return { success: false, message: 'No file selected' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('file:getImagePath', async (event, fileName) => {
    try {
      if (!fileName) {
        return { success: false, path: '' };
      }
      const imagesDir = path.join(app.getPath('userData'), 'product-images');
      const fullPath = path.join(imagesDir, fileName);
      
      if (fs.existsSync(fullPath)) {
        return { success: true, path: fullPath };
      }
      
      return { success: false, path: '' };
    } catch (error) {
      return { success: false, path: '' };
    }
  });
};

