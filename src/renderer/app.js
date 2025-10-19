// Application State
const state = {
    currentUser: null,
    cart: [],
    products: [],
    orders: [],
    users: [],
    settings: {},
    discount: 0,
    shipping: 0
  };
  
  // Initialize App
  document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    
    // Check for saved session before showing login
    checkSavedSession();
    
    // Apply initial translations
    if (window.applyAllTranslations) {
      window.applyAllTranslations();
    }
    
    // Setup language switcher
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
      langSelect.value = window.translator.getCurrentLanguage();
      langSelect.addEventListener('change', (e) => {
        window.translator.setLanguage(e.target.value);
        // Apply translations without reloading (keeps user logged in)
        applyAllTranslations();
      });
    }
  });
  
  // Event Listeners
  function initializeEventListeners() {
    // Login
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const screen = item.getAttribute('data-screen');
        switchScreen(screen);
      });
    });
  
    // POS
    document.getElementById('product-search').addEventListener('input', debounce(handleProductSearch, 300));
    document.getElementById('clear-cart').addEventListener('click', clearCart);
    document.getElementById('complete-sale').addEventListener('click', completeSale);
    document.getElementById('cart-discount').addEventListener('input', updateCartTotals);
    document.getElementById('cart-shipping').addEventListener('input', updateCartTotals);
  
    // Products
    document.getElementById('add-product-btn').addEventListener('click', () => showProductModal());
  
    // Expenses
    document.getElementById('add-expense-btn').addEventListener('click', () => showExpenseModal());
  
    // Reports
    document.getElementById('generate-report').addEventListener('click', generateReport);
    setDefaultReportDates();
  
    // Backup
    document.getElementById('create-backup-btn').addEventListener('click', createBackup);
    document.getElementById('import-backup-btn').addEventListener('click', importBackup);
  
    // Settings
    document.getElementById('settings-form').addEventListener('submit', saveSettings);
  
    // Users
    document.getElementById('add-user-btn').addEventListener('click', () => showUserModal());
  
    // Modal
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') {
        closeModal();
      }
    });
  }
  
  // Session Management
  function saveSession(user) {
    // Save user session to localStorage (without password)
    const sessionData = {
      id: user.id,
      username: user.username,
      role: user.role,
      display_name: user.display_name,
      timestamp: Date.now()
    };
    localStorage.setItem('userSession', JSON.stringify(sessionData));
  }
  
  function clearSession() {
    localStorage.removeItem('userSession');
  }
  
  function getSavedSession() {
    const sessionData = localStorage.getItem('userSession');
    if (!sessionData) return null;
    
    try {
      const session = JSON.parse(sessionData);
      // Optional: Check if session is not too old (e.g., 30 days)
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      if (Date.now() - session.timestamp > maxAge) {
        clearSession();
        return null;
      }
      return session;
    } catch (error) {
      clearSession();
      return null;
    }
  }
  
  async function checkSavedSession() {
    const savedSession = getSavedSession();
    
    if (savedSession) {
      // Restore session without password validation
      state.currentUser = savedSession;
      showMainScreen();
      loadInitialData();
    } else {
      // No saved session, show login
      showLoginScreen();
    }
  }
  
  // Authentication
  async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');
  
    const result = await window.API.login(username, password);
    
    if (result.success) {
      state.currentUser = result.user;
      saveSession(result.user); // Save session for next time
      showMainScreen();
      loadInitialData();
    } else {
      errorEl.textContent = result.message;
      errorEl.classList.add('active');
    }
  }
  
  function handleLogout() {
    state.currentUser = null;
    state.cart = [];
    clearSession(); // Clear saved session on explicit logout
    showLoginScreen();
  }
  
  function showLoginScreen() {
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    // Translate login screen
    if (window.translator) {
      const t = (key) => window.translator.t(key);
      document.getElementById('login-title').textContent = '🛒 ' + t('login_title');
      document.getElementById('login-subtitle').textContent = t('login_subtitle');
      document.getElementById('label-username').textContent = t('username');
      document.getElementById('label-password').textContent = t('password');
      document.getElementById('login-btn').textContent = t('login_button');
    }
  }
  
  function showMainScreen() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
    document.getElementById('user-info').textContent = `${state.currentUser.display_name} (${state.currentUser.role})`;
    
    // Translate UI elements
    if (window.translator) {
      const t = (key) => window.translator.t(key);
      
      // Update search placeholder
      const searchInput = document.getElementById('product-search');
      if (searchInput) {
        searchInput.placeholder = t('search_products');
      }
      
      // Update navigation
      const navItems = document.querySelectorAll('.nav-item');
      const navKeys = ['nav_pos', 'nav_products', 'nav_orders', 'nav_expenses', 'nav_reports', 'nav_backup', 'nav_settings', 'nav_users'];
      navItems.forEach((item, i) => {
        if (navKeys[i]) {
          const icon = item.querySelector('.icon');
          const iconText = icon ? icon.textContent : '';
          item.innerHTML = `<span class="icon">${iconText}</span> ${t(navKeys[i])}`;
        }
      });
      
      // Translate cart labels immediately
      const labelSubtotal = document.getElementById('label-subtotal');
      const labelDiscount = document.getElementById('label-discount');
      const labelShipping = document.getElementById('label-shipping');
      const labelTax = document.getElementById('label-tax');
      const labelTotal = document.getElementById('label-total');
      const labelPaymentMethod = document.getElementById('label-payment-method');
      const labelCustomerName = document.getElementById('label-customer-name');
      
      if (labelSubtotal) labelSubtotal.textContent = t('subtotal') + ':';
      if (labelDiscount) labelDiscount.textContent = t('discount') + ':';
      if (labelShipping) labelShipping.textContent = t('shipping') + ':';
      if (labelTax) labelTax.textContent = t('tax') + ':';
      if (labelTotal) labelTotal.textContent = t('total') + ':';
      if (labelPaymentMethod) labelPaymentMethod.textContent = t('payment_method');
      if (labelCustomerName) labelCustomerName.textContent = t('customer_name');
      
      // Update payment method options
      const paymentSelect = document.getElementById('payment-method');
      if (paymentSelect) {
        paymentSelect.innerHTML = `
          <option value="cash">${t('cash')}</option>
          <option value="card">${t('card')}</option>
          <option value="wallet">${t('wallet')}</option>
          <option value="credit">${t('credit')}</option>
        `;
      }
    }
    
    // Apply all translations
    if (window.applyAllTranslations) {
      setTimeout(() => window.applyAllTranslations(), 100);
    }
  }
  
  // Load Initial Data
  async function loadInitialData() {
    await loadProducts();
    await loadSettings();
    loadOrders();
    loadBackups();
    
    // Apply translations after data loads
    setTimeout(() => {
      if (window.applyAllTranslations) {
        window.applyAllTranslations();
      }
    }, 500);
  }
  
  // Products
  async function loadProducts() {
    const result = await window.API.getProducts();
    if (result.success) {
      state.products = result.data;
      renderProducts();
      renderProductsTable();
    }
  }
  
  async function handleProductSearch(e) {
    const query = e.target.value.trim();
    
    if (query.length === 0) {
      renderProducts();
      return;
    }
  
    const result = await window.API.searchProducts(query);
    if (result.success) {
      renderProductsGrid(result.data);
    }
  }
  
  function renderProducts() {
    renderProductsGrid(state.products);
  }
  
  async function renderProductsGrid(products) {
    const grid = document.getElementById('product-results');
    const t = (key) => window.translator ? window.translator.t(key) : key;
    
    if (products.length === 0) {
      grid.innerHTML = `<div class="empty-state"><h3>${t('no_results')}</h3></div>`;
      return;
    }
  
    const productCards = await Promise.all(products.map(async product => {
      let imageHtml = '<div class="product-card-image no-image">📦</div>';
      
      if (product.image_path) {
        const imgResult = await window.API.getImagePath(product.image_path);
        if (imgResult.success && imgResult.path) {
          imageHtml = `<img src="file://${imgResult.path}" class="product-card-image" alt="${product.name}">`;
        }
      }
      
      return `
        <div class="product-card" onclick="addToCart('${product.id}')">
          ${imageHtml}
          <h4>${product.name}</h4>
          <div class="sku">SKU: ${product.sku}</div>
          <div class="price">${formatCurrency(product.price)}</div>
          <div class="stock ${product.stock_quantity < 10 ? 'low-stock' : ''}">
            Stock: ${product.stock_quantity} ${product.unit}
          </div>
        </div>
      `;
    }));
  
    grid.innerHTML = productCards.join('');
  }
  
  function renderProductsTable() {
    const tbody = document.querySelector('#products-table tbody');
    const t = (key) => window.translator ? window.translator.t(key) : key;
    
    tbody.innerHTML = state.products.map(product => `
      <tr>
        <td>${product.sku}</td>
        <td>${product.name}</td>
        <td>${product.category || '-'}</td>
        <td>${formatCurrency(product.price)}</td>
        <td class="${product.stock_quantity < 10 ? 'low-stock' : ''}">${product.stock_quantity}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="editProduct('${product.id}')">${t('edit')}</button>
          <button class="btn btn-sm btn-secondary" onclick="adjustStock('${product.id}')">${t('stock')}</button>
          <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')">${t('delete')}</button>
        </td>
      </tr>
    `).join('');
  }
  
  function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
  
    const existingItem = state.cart.find(item => item.product_id === productId);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      state.cart.push({
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        price: product.price,
        tax_rate: product.tax_rate || 0
      });
    }
  
    renderCart();
    updateCartTotals();
  }
  
  function renderCart() {
    const container = document.getElementById('cart-items');
    
    if (state.cart.length === 0) {
      container.innerHTML = '<div class="empty-state"><h3>Cart is empty</h3></div>';
      return;
    }
  
    container.innerHTML = state.cart.map((item, index) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h5>${item.product_name}</h5>
          <div class="sku">${formatCurrency(item.price)} x ${item.quantity} = ${formatCurrency(item.price * item.quantity)}</div>
        </div>
        <div class="cart-item-controls">
          <button onclick="updateCartQuantity(${index}, -1)">-</button>
          <input type="number" value="${item.quantity}" min="1" onchange="setCartQuantity(${index}, this.value)">
          <button onclick="updateCartQuantity(${index}, 1)">+</button>
          <button class="btn-danger" onclick="removeFromCart(${index})">×</button>
        </div>
      </div>
    `).join('');
  }
  
  function updateCartQuantity(index, change) {
    if (state.cart[index]) {
      state.cart[index].quantity = Math.max(1, state.cart[index].quantity + change);
      renderCart();
      updateCartTotals();
    }
  }
  
  function setCartQuantity(index, value) {
    const qty = parseInt(value) || 1;
    if (state.cart[index]) {
      state.cart[index].quantity = Math.max(1, qty);
      renderCart();
      updateCartTotals();
    }
  }
  
  function removeFromCart(index) {
    state.cart.splice(index, 1);
    renderCart();
    updateCartTotals();
  }
  
  function clearCart() {
    if (state.cart.length === 0) return;
    if (confirm('Clear cart?')) {
      state.cart = [];
      renderCart();
      updateCartTotals();
    }
  }
  
  function updateCartTotals() {
    const discount = parseFloat(document.getElementById('cart-discount').value) || 0;
    const shipping = parseFloat(document.getElementById('cart-shipping').value) || 0;
    
    state.discount = discount;
    state.shipping = shipping;
  
    let subtotal = 0;
    let taxTotal = 0;
  
    state.cart.forEach(item => {
      const itemTotal = item.quantity * item.price;
      subtotal += itemTotal;
      taxTotal += (itemTotal * ((item.tax_rate || 0) / 100));
    });
  
    const total = subtotal + taxTotal - discount + shipping;
  
    document.getElementById('cart-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('cart-tax').textContent = formatCurrency(taxTotal);
    document.getElementById('cart-total').textContent = formatCurrency(total);
  }
  
  async function completeSale() {
    if (state.cart.length === 0) {
      alert('Cart is empty');
      return;
    }
  
    const paymentMethod = document.getElementById('payment-method').value;
    const customerName = document.getElementById('customer-name').value;
  
    const subtotal = state.cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxTotal = state.cart.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price;
      return sum + (itemTotal * ((item.tax_rate || 0) / 100));
    }, 0);
    const total = subtotal + taxTotal - state.discount + state.shipping;
  
    const orderData = {
      customer_name: customerName,
      customer_phone: '',
      customer_email: '',
      notes: '',
      subtotal,
      tax: taxTotal,
      discount: state.discount,
      shipping: state.shipping,
      total,
      payment_method: paymentMethod,
      items: state.cart.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price
      })),
      payments: [{
        amount: total,
        method: paymentMethod,
        reference: ''
      }]
    };
  
    const result = await window.API.createOrder(orderData);
    
    if (result.success) {
      alert(`Sale completed! Order #${result.orderNumber}`);
      state.cart = [];
      state.discount = 0;
      state.shipping = 0;
      document.getElementById('cart-discount').value = '0';
      document.getElementById('cart-shipping').value = '0';
      document.getElementById('customer-name').value = '';
      renderCart();
      updateCartTotals();
      await loadProducts(); // Refresh stock
    } else {
      alert('Error: ' + result.message);
    }
  }
  
  // Orders
  async function loadOrders() {
    const result = await window.API.getOrders({ limit: 100 });
    if (result.success) {
      state.orders = result.data;
      renderOrdersTable();
    }
  }
  
  function renderOrdersTable() {
    const tbody = document.querySelector('#orders-table tbody');
    const t = (key) => window.translator ? window.translator.t(key) : key;
    
    if (state.orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><h3>${t('no_results')}</h3></div></td></tr>`;
      return;
    }
  
    tbody.innerHTML = state.orders.map(order => `
      <tr>
        <td>${order.order_number}</td>
        <td>${formatDate(order.created_at)}</td>
        <td>${order.customer_name || '-'}</td>
        <td>-</td>
        <td>${formatCurrency(order.total)}</td>
        <td><span class="badge badge-success">${order.status}</span></td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="viewOrder('${order.id}')">${t('view')}</button>
        </td>
      </tr>
    `).join('');
  }
  
  async function viewOrder(orderId) {
    const result = await window.API.getOrder(orderId);
    if (result.success) {
      const order = result.data;
      const t = (key) => window.translator ? window.translator.t(key) : key;
      
      showModal(`
        <div class="modal-header">
          <h3>${t('order_details')} ${order.order_number}</h3>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div>
          <p><strong>${t('date')}:</strong> ${formatDate(order.created_at)}</p>
          <p><strong>${t('customer')}:</strong> ${order.customer_name || '-'}</p>
          <p><strong>${t('status')}:</strong> ${order.status}</p>
          <hr>
          <h4>${t('items')}</h4>
          <table class="data-table">
            <thead>
              <tr>
                <th>${t('product')}</th>
                <th>${t('quantity')}</th>
                <th>${t('price')}</th>
                <th>${t('total')}</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map(item => `
                <tr>
                  <td>${item.product_name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price || 0)}</td>
                  <td>${formatCurrency(item.subtotal || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <hr>
          <div style="text-align: ${window.translator?.getCurrentLanguage() === 'ar' ? 'right' : 'right'};">
            <p>${t('subtotal')}: ${formatCurrency(order.subtotal || 0)}</p>
            <p>${t('tax')}: ${formatCurrency(order.tax || 0)}</p>
            <p>${t('discount')}: ${formatCurrency(order.discount || 0)}</p>
            <p>${t('shipping')}: ${formatCurrency(order.shipping || 0)}</p>
            <p><strong>${t('total')}: ${formatCurrency(order.total || 0)}</strong></p>
          </div>
          <hr>
          <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
            <button class="btn btn-primary" onclick="printOrder('${orderId}', 'invoice')">${t('download_invoice')}</button>
            <button class="btn btn-primary" onclick="printOrder('${orderId}', 'receipt')">${t('download_receipt')}</button>
            <button class="btn btn-secondary" onclick="printThermal('${orderId}')">$t('print_thermal')}</button>
          </div>
        </div>
      `);
    }
  }
  
  async function printOrder(orderId, type) {
    const result = await window.API.generatePDF({ orderId, type });
    if (result.success) {
      alert(`PDF saved to: ${result.path}`);
    } else {
      alert('Error: ' + result.message);
    }
  }
  
  async function printThermal(orderId) {
    const result = await window.API.printThermal(orderId);
    if (result.success) {
      alert('Receipt sent to thermal printer');
    } else {
      alert('Error: ' + result.message + '\nMake sure thermal printer is connected.');
    }
  }
  
  // Expenses
  async function loadExpenses() {
    const result = await window.API.getExpenses();
    if (result.success) {
      renderExpensesTable(result.data);
    }
  }
  
  function renderExpensesTable(expenses) {
    const tbody = document.querySelector('#expenses-table tbody');
    const t = (key) => window.translator ? window.translator.t(key) : key;
    
    if (expenses.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><h3>${t('no_results')}</h3></div></td></tr>`;
      return;
    }
  
    tbody.innerHTML = expenses.map(expense => `
      <tr>
        <td>${formatDate(expense.created_at)}</td>
        <td>${expense.title}</td>
        <td>${expense.category || '-'}</td>
        <td>${formatCurrency(expense.amount)}</td>
        <td>${expense.paid_by || '-'}</td>
      </tr>
    `).join('');
  }
  
  function showExpenseModal() {
    const t = (key) => window.translator ? window.translator.t(key) : key;
    
    showModal(`
      <div class="modal-header">
        <h3>${t('add_expense')}</h3>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <form id="expense-form">
        <div class="form-group">
          <label>${t('title')}</label>
          <input type="text" name="title" required>
        </div>
        <div class="form-group">
          <label>${t('amount')}</label>
          <input type="number" name="amount" step="0.01" required>
        </div>
        <div class="form-group">
          <label>${t('category')}</label>
          <input type="text" name="category">
        </div>
        <div class="form-group">
          <label>${t('paid_by')}</label>
          <input type="text" name="paid_by">
        </div>
        <div class="form-group">
          <label>${t('notes')}</label>
          <textarea name="notes" rows="3"></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-block">${t('add_expense')}</button>
      </form>
    `);
  
    document.getElementById('expense-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        title: formData.get('title'),
        amount: parseFloat(formData.get('amount')),
        category: formData.get('category'),
        paid_by: formData.get('paid_by'),
        notes: formData.get('notes'),
        user_id: state.currentUser.id
      };
  
      const result = await window.API.createExpense(data);
      if (result.success) {
        alert('Expense added successfully');
        closeModal();
        loadExpenses();
      } else {
        alert('Error: ' + result.message);
      }
    });
  }
  
  // Reports
  function setDefaultReportDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('report-start-date').valueAsDate = firstDay;
    document.getElementById('report-end-date').valueAsDate = today;
  }
  
  async function generateReport() {
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
  
    if (!startDate || !endDate) {
      alert('Please select date range');
      return;
    }
  
    const result = await window.API.generateReport(startDate, endDate);
  
    if (result.success) {
      const report = result.report || {};
      document.getElementById('stat-revenue').textContent = formatCurrency(report.totalRevenue || 0);
      document.getElementById('stat-orders').textContent = report.totalOrders || 0;
      document.getElementById('stat-avg').textContent = formatCurrency(report.avgOrderValue || 0);
      document.getElementById('stat-profit').textContent = formatCurrency(report.grossProfit || 0);
  
      const topProductsTbody = document.querySelector('#top-products-table tbody');
      const topProducts = report.topProducts || [];
      topProductsTbody.innerHTML = topProducts.map(p => `
        <tr>
          <td>${p.product_name || '-'}</td>
          <td>${p.sku || '-'}</td>
          <td>${p.total_sold || 0}</td>
          <td>${formatCurrency(p.total_revenue || 0)}</td>
        </tr>
      `).join('');
    } else {
      alert('Error generating report: ' + (result.error || result.message || 'Unknown error'));
    }
  }
  
  // Settings
  async function loadSettings() {
    const result = await window.API.getSettings();
    if (result.success) {
      state.settings = result.settings || result.data || {};
      populateSettingsForm();
    } else {
      state.settings = {};
    }
  }
  
  function populateSettingsForm() {
    const form = document.getElementById('settings-form');
    if (!state.settings || typeof state.settings !== 'object') {
      state.settings = {};
      return;
    }
    
    Object.entries(state.settings).forEach(([key, value]) => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = value;
      }
    });
  }
  
  async function saveSettings(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const settings = {};
    
    for (const [key, value] of formData.entries()) {
      settings[key] = value;
    }
  
    const result = await window.API.updateSettings(settings);
    if (result.success) {
      alert('Settings saved successfully');
      state.settings = settings;
    } else {
      alert('Error: ' + result.message);
    }
  }
  
  // Backup
  async function loadBackups() {
    const result = await window.API.listBackups();
    console.log('Backups result:', result);
    if (result.success) {
      renderBackupsTable(result.data || []);
    } else {
      console.error('Failed to load backups:', result);
      renderBackupsTable([]);
    }
  }
  
  function renderBackupsTable(backups) {
    const tbody = document.querySelector('#backups-table tbody');
    if (!tbody) {
      console.error('Backups table body not found');
      return;
    }
    
    const t = (key) => window.translator ? window.translator.t(key) : key;
    
    console.log('Rendering backups:', backups);
    
    if (!backups || backups.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">
        <div class="empty-state">
          <h3>No backups yet</h3>
          <p>Click "Create Backup Now" button above to create your first backup.</p>
        </div>
      </td></tr>`;
      return;
    }
  
    tbody.innerHTML = backups.map(backup => `
      <tr>
        <td>${backup.name || 'Unknown'}</td>
        <td>${backup.timestamp ? formatDate(backup.timestamp) : 'Unknown'}</td>
        <td><span class="badge ${backup.type === 'auto' ? 'badge-success' : 'badge-warning'}">${backup.type || 'manual'}</span></td>
        <td>${formatFileSize(backup.size)}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="exportBackup('${backup.name}')">${t('export')}</button>
        </td>
      </tr>
    `).join('');
  }
  
  async function createBackup() {
    if (!confirm('Create backup now?')) return;
    
    const result = await window.API.createBackup();
    if (result.success) {
      alert('Backup created successfully!');
      await loadBackups(); // Reload the backup list
    } else {
      alert('Error creating backup: ' + (result.error || result.message || 'Unknown error'));
    }
  }
  
  async function exportBackup(backupName) {
    const result = await window.API.exportBackup(backupName);
    if (result.success) {
      alert('Backup exported successfully');
    } else {
      alert('Error: ' + result.message);
    }
  }
  
  async function importBackup() {
    if (!confirm('Import backup? This will replace current data!')) return;
    
    const result = await window.API.importBackup();
    if (result.success) {
      alert('Backup restored successfully. Please restart the application.');
    } else if (result.message !== 'Import cancelled') {
      alert('Error: ' + result.message);
    }
  }
  
  // Users
  async function loadUsers() {
    const result = await window.API.getUsers();
    if (result.success) {
      state.users = result.data || [];
      renderUsersTable(state.users);
    }
  }
  
  function renderUsersTable(users) {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;
    
    const t = (key) => window.translator ? window.translator.t(key) : key;
    
    if (!users || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No users found</td></tr>';
      return;
    }
    
    tbody.innerHTML = users.map(user => `
      <tr>
        <td>${user.username}</td>
        <td>${user.display_name || user.username}</td>
        <td><span class="badge badge-success">${t(user.role || 'staff')}</span></td>
        <td><span class="badge ${user.is_active ? 'badge-success' : 'badge-danger'}">${user.is_active ? t('active') : t('inactive')}</span></td>
        <td>${formatDate(user.created_at)}</td>
      </tr>
    `).join('');
  }
  
  function showUserModal() {
    const t = (key) => window.translator ? window.translator.t(key) : key;
    
    showModal(`
      <div class="modal-header">
        <h3>${t('add_user')}</h3>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <form id="user-form">
        <div class="form-group">
          <label>${t('username')}</label>
          <input type="text" name="username" required>
        </div>
        <div class="form-group">
          <label>${t('display_name')}</label>
          <input type="text" name="display_name" required>
        </div>
        <div class="form-group">
          <label>${t('password')}</label>
          <input type="password" name="password" required>
        </div>
        <div class="form-group">
          <label>${t('role')}</label>
          <select name="role" required>
            <option value="cashier">${t('cashier')}</option>
            <option value="manager">${t('manager')}</option>
            <option value="admin">${t('admin')}</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary btn-block">${t('add_user')}</button>
      </form>
    `);
  
    document.getElementById('user-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        username: formData.get('username'),
        display_name: formData.get('display_name'),
        password: formData.get('password'),
        role: formData.get('role')
      };
  
      const result = await window.API.createUser(data);
      if (result.success) {
        alert('User added successfully');
        closeModal();
        loadUsers();
      } else {
        alert('Error: ' + result.message);
      }
    });
  }
  
  // Product Modal
  async function showProductModal(productId = null) {
    const product = productId ? state.products.find(p => p.id === productId) : null;
    const isEdit = !!product;
    const t = (key) => window.translator ? window.translator.t(key) : key;
    
    let currentImagePath = product?.image_path || '';
    let imagePreviewHtml = `<div class="no-image">${t('no_image')}</div>`;
    
    if (currentImagePath) {
      const imgResult = await window.API.getImagePath(currentImagePath);
      if (imgResult.success && imgResult.path) {
        imagePreviewHtml = `<img src="file://${imgResult.path}" alt="Product">`;
      }
    }
  
    showModal(`
      <div class="modal-header">
        <h3>${isEdit ? t('edit_product') : t('add_product')}</h3>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <form id="product-form">
        <div class="form-group">
          <label>${t('product_image')}</label>
          <div class="product-image-preview" id="product-image-preview">
            ${imagePreviewHtml}
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <button type="button" class="btn btn-secondary image-upload-btn" onclick="selectProductImage()">${t('choose_image')}</button>
            ${window.API && window.API.isWeb() ? '<small style="color: #888;">⚠️ Image upload not available in web version (desktop only)</small>' : ''}
          </div>
          <input type="hidden" name="image_path" id="product-image-path" value="${currentImagePath}">
        </div>
        <div class="form-group">
          <label>${t('sku')}</label>
          <input type="text" name="sku" value="${product?.sku || ''}" required>
        </div>
        <div class="form-group">
          <label>${t('name')}</label>
          <input type="text" name="name" value="${product?.name || ''}" required>
        </div>
        <div class="form-group">
          <label>${t('description')}</label>
          <textarea name="description" rows="2">${product?.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>${t('category')}</label>
          <input type="text" name="category" value="${product?.category || ''}">
        </div>
        <div class="form-group">
          <label>${t('price')}</label>
          <input type="number" name="price" step="0.01" value="${product?.price || ''}" required>
        </div>
        <div class="form-group">
          <label>${t('cost_price')}</label>
          <input type="number" name="cost_price" step="0.01" value="${product?.cost_price || '0'}">
        </div>
        <div class="form-group">
          <label>${t('tax_rate')}</label>
          <input type="number" name="tax_rate" step="0.01" value="${product?.tax_rate || state.settings.default_tax_rate || '0'}">
        </div>
        <div class="form-group">
          <label>${t('stock_quantity')}</label>
          <input type="number" name="stock_quantity" value="${product?.stock_quantity || '0'}">
        </div>
        <div class="form-group">
          <label>${t('unit')}</label>
          <input type="text" name="unit" value="${product?.unit || 'pcs'}">
        </div>
        <button type="submit" class="btn btn-primary btn-block">${isEdit ? t('update_product') : t('add_product')}</button>
      </form>
    `);
  
    document.getElementById('product-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        sku: formData.get('sku'),
        name: formData.get('name'),
        description: formData.get('description'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        cost_price: parseFloat(formData.get('cost_price')),
        tax_rate: parseFloat(formData.get('tax_rate')),
        stock_quantity: parseInt(formData.get('stock_quantity')),
        unit: formData.get('unit'),
        image_path: formData.get('image_path')
      };
  
      const result = isEdit 
        ? await window.API.updateProduct(productId, data)
        : await window.API.createProduct(data);
  
      if (result.success) {
        alert(`Product ${isEdit ? 'updated' : 'added'} successfully`);
        closeModal();
        await loadProducts();
      } else {
        alert('Error: ' + result.message);
      }
    });
  }
  
  // Select product image
  async function selectProductImage() {
    const result = await window.API.selectImage();
    if (result.success) {
      document.getElementById('product-image-path').value = result.path;
      
      // Update preview
      const imgResult = await window.API.getImagePath(result.path);
      if (imgResult.success && imgResult.path) {
        document.getElementById('product-image-preview').innerHTML = 
          `<img src="file://${imgResult.path}" alt="Product">`;
      }
    }
  }
  
  function editProduct(productId) {
    showProductModal(productId);
  }
  
  function adjustStock(productId) {
    const product = state.products.find(p => p.id === productId);
    const t = (key) => window.translator ? window.translator.t(key) : key;
    
    showModal(`
      <div class="modal-header">
        <h3>${t('adjust_stock')}: ${product.name}</h3>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <p>${t('current_stock')}: ${product.stock_quantity} ${product.unit}</p>
      <form id="stock-form">
        <div class="form-group">
          <label>${t('quantity_change')}</label>
          <input type="number" name="quantity_change" required>
        </div>
        <div class="form-group">
          <label>${t('reason')}</label>
          <select name="reason" required>
            <option value="purchase">${t('reason_purchase')}</option>
            <option value="return">${t('reason_return')}</option>
            <option value="damage">${t('reason_damage')}</option>
            <option value="correction">${t('reason_correction')}</option>
            <option value="other">${t('reason_other')}</option>
          </select>
        </div>
        <div class="form-group">
          <label>${t('notes')}</label>
          <textarea name="notes" rows="3"></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-block">${t('adjust_stock')}</button>
      </form>
    `);
  
    document.getElementById('stock-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        productId,
        quantityChange: parseInt(formData.get('quantity_change')),
        reason: formData.get('reason'),
        notes: formData.get('notes'),
        userId: state.currentUser.id
      };
  
      const result = await window.API.adjustStock(data);
      if (result.success) {
        alert('Stock adjusted successfully');
        closeModal();
        await loadProducts();
      } else {
        alert('Error: ' + result.message);
      }
    });
  }
  
  // Navigation
  function switchScreen(screenName) {
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-screen="${screenName}"]`).classList.add('active');
  
    // Update content panels
    document.querySelectorAll('.content-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById(`${screenName}-content`).classList.add('active');
  
    // Load data for specific screens
    if (screenName === 'orders') loadOrders();
    if (screenName === 'expenses') loadExpenses();
    if (screenName === 'users') loadUsers();
    if (screenName === 'backup') loadBackups();
    
    // Reapply translations
    setTimeout(() => {
      if (window.applyAllTranslations) {
        window.applyAllTranslations();
      }
    }, 100);
  }
  
  // Modal
  function showModal(content) {
    document.getElementById('modal-content').innerHTML = content;
    document.getElementById('modal-overlay').classList.add('active');
  }
  
  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
  }
  
  // Apply all translations dynamically
  function applyAllTranslations() {
    if (!window.translator) return;
    
    const t = (key) => window.translator.t(key);
    
    // Update login screen if visible
    if (document.getElementById('login-screen').classList.contains('active')) {
      document.getElementById('login-title').textContent = '🛒 ' + t('login_title');
      document.getElementById('login-subtitle').textContent = t('login_subtitle');
      document.getElementById('label-username').textContent = t('username');
      document.getElementById('label-password').textContent = t('password');
      document.getElementById('login-btn').textContent = t('login_button');
    }
    
    // Update main screen if visible
    if (document.getElementById('main-screen').classList.contains('active')) {
      // Update search placeholder
      const searchInput = document.getElementById('product-search');
      if (searchInput) {
        searchInput.placeholder = t('search_products');
      }
      
      // Update navigation
      const navItems = document.querySelectorAll('.nav-item');
      const navKeys = ['nav_pos', 'nav_products', 'nav_orders', 'nav_expenses', 'nav_reports', 'nav_backup', 'nav_settings', 'nav_users'];
      navItems.forEach((item, i) => {
        if (navKeys[i]) {
          const icon = item.querySelector('.icon');
          const iconText = icon ? icon.textContent : '';
          const currentScreen = item.getAttribute('data-screen');
          const isActive = item.classList.contains('active');
          item.innerHTML = `<span class="icon">${iconText}</span> ${t(navKeys[i])}`;
          if (isActive) item.classList.add('active');
          item.setAttribute('data-screen', currentScreen);
        }
      });
      
      // Re-attach navigation click handlers
      document.querySelectorAll('.nav-item').forEach(item => {
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        newItem.addEventListener('click', (e) => {
          e.preventDefault();
          const screen = newItem.getAttribute('data-screen');
          switchScreen(screen);
        });
      });
      
      // Update panel headers
      document.querySelector('#pos-content .cart-header h3').textContent = t('current_order');
      document.querySelector('#products-content .panel-header h2').textContent = t('products_management');
      document.querySelector('#orders-content .panel-header h2').textContent = t('orders_history');
      document.querySelector('#expenses-content .panel-header h2').textContent = t('expenses_management');
      document.querySelector('#reports-content .panel-header h2').textContent = t('reports_analytics');
      document.querySelector('#backup-content .panel-header h2').textContent = t('backup_restore');
      document.querySelector('#settings-content .panel-header h2').textContent = t('settings');
      document.querySelector('#users-content .panel-header h2').textContent = t('users_management');
      
      // Update buttons
      document.getElementById('clear-cart').textContent = t('clear');
      document.getElementById('complete-sale').textContent = t('complete_sale');
      document.getElementById('logout-btn').textContent = t('logout');
      document.getElementById('add-product-btn').textContent = '+ ' + t('add_product');
      document.getElementById('add-expense-btn').textContent = '+ ' + t('add_expense');
      document.getElementById('add-user-btn').textContent = '+ ' + t('add_user');
      document.getElementById('create-backup-btn').textContent = t('create_backup');
      document.getElementById('import-backup-btn').textContent = t('import_backup');
      document.getElementById('generate-report').textContent = t('generate_report');
      
      // Update cart labels
      const labelSubtotal = document.getElementById('label-subtotal');
      const labelDiscount = document.getElementById('label-discount');
      const labelShipping = document.getElementById('label-shipping');
      const labelTax = document.getElementById('label-tax');
      const labelTotal = document.getElementById('label-total');
      const labelPaymentMethod = document.getElementById('label-payment-method');
      const labelCustomerName = document.getElementById('label-customer-name');
      
      if (labelSubtotal) labelSubtotal.textContent = t('subtotal') + ':';
      if (labelDiscount) labelDiscount.textContent = t('discount') + ':';
      if (labelShipping) labelShipping.textContent = t('shipping') + ':';
      if (labelTax) labelTax.textContent = t('tax') + ':';
      if (labelTotal) labelTotal.textContent = t('total') + ':';
      if (labelPaymentMethod) labelPaymentMethod.textContent = t('payment_method');
      if (labelCustomerName) labelCustomerName.textContent = t('customer_name');
      
      // Update payment method options
      const paymentSelect = document.getElementById('payment-method');
      if (paymentSelect) {
        paymentSelect.innerHTML = `
          <option value="cash">${t('cash')}</option>
          <option value="card">${t('card')}</option>
          <option value="wallet">${t('wallet')}</option>
          <option value="credit">${t('credit')}</option>
        `;
      }
      
      // Update table headers
      updateTableHeaders();
      
      // Update report filters
      const reportLabels = document.querySelectorAll('#reports-content .form-group label');
      if (reportLabels[0]) reportLabels[0].textContent = t('start_date');
      if (reportLabels[1]) reportLabels[1].textContent = t('end_date');
      
      // Update stat cards
      const statCards = document.querySelectorAll('.stat-card h3');
      if (statCards[0]) statCards[0].textContent = t('total_revenue');
      if (statCards[1]) statCards[1].textContent = t('total_orders');
      if (statCards[2]) statCards[2].textContent = t('gross_profit');
      if (statCards[3]) statCards[3].textContent = t('avg_order_value');
      
      // Update top products header
      const topProductsH3 = document.querySelector('.top-products h3');
      if (topProductsH3) topProductsH3.textContent = t('top_selling_products');
      
      // Update settings form
      updateSettingsForm();
      
      // Reload current data to show translations
      const activePanel = document.querySelector('.content-panel.active');
      if (activePanel) {
        const panelId = activePanel.id;
        if (panelId === 'products-content') renderProductsTable();
        if (panelId === 'orders-content') renderOrdersTable();
        if (panelId === 'expenses-content') loadExpenses();
        if (panelId === 'users-content') renderUsersTable(state.users || []);
        if (panelId === 'backup-content') {
          const backupsTableH3 = document.querySelector('.backup-list h3');
          if (backupsTableH3) backupsTableH3.textContent = t('available_backups');
        }
      }
    }
  }
  
  function updateTableHeaders() {
    const t = (key) => window.translator.t(key);
    
    // Products table
    const productsHeaders = document.querySelectorAll('#products-table thead th');
    if (productsHeaders.length > 0) {
      productsHeaders[0].textContent = t('sku');
      productsHeaders[1].textContent = t('name');
      productsHeaders[2].textContent = t('category');
      productsHeaders[3].textContent = t('price');
      productsHeaders[4].textContent = t('stock');
      productsHeaders[5].textContent = t('actions');
    }
    
    // Orders table
    const ordersHeaders = document.querySelectorAll('#orders-table thead th');
    if (ordersHeaders.length > 0) {
      ordersHeaders[0].textContent = t('order_number');
      ordersHeaders[1].textContent = t('date');
      ordersHeaders[2].textContent = t('customer');
      ordersHeaders[3].textContent = t('items');
      ordersHeaders[4].textContent = t('total');
      ordersHeaders[5].textContent = t('status');
      ordersHeaders[6].textContent = t('actions');
    }
    
    // Expenses table
    const expensesHeaders = document.querySelectorAll('#expenses-table thead th');
    if (expensesHeaders.length > 0) {
      expensesHeaders[0].textContent = t('date');
      expensesHeaders[1].textContent = t('title');
      expensesHeaders[2].textContent = t('category');
      expensesHeaders[3].textContent = t('amount');
      expensesHeaders[4].textContent = t('paid_by');
    }
    
    // Users table
    const usersHeaders = document.querySelectorAll('#users-table thead th');
    if (usersHeaders.length > 0) {
      usersHeaders[0].textContent = t('username');
      usersHeaders[1].textContent = t('display_name');
      usersHeaders[2].textContent = t('role');
      usersHeaders[3].textContent = t('status');
      usersHeaders[4].textContent = t('created');
    }
    
    // Backups table
    const backupsHeaders = document.querySelectorAll('#backups-table thead th');
    if (backupsHeaders.length > 0) {
      backupsHeaders[0].textContent = t('name');
      backupsHeaders[1].textContent = t('date');
      backupsHeaders[2].textContent = t('type');
      backupsHeaders[3].textContent = t('size');
      backupsHeaders[4].textContent = t('actions');
    }
    
    // Top products table
    const topProductsHeaders = document.querySelectorAll('#top-products-table thead th');
    if (topProductsHeaders.length > 0) {
      topProductsHeaders[0].textContent = t('product');
      topProductsHeaders[1].textContent = t('sku');
      topProductsHeaders[2].textContent = t('sold');
      topProductsHeaders[3].textContent = t('revenue');
    }
  }
  
  function updateSettingsForm() {
    const t = (key) => window.translator.t(key);
    
    // Settings sections
    const settingsSections = document.querySelectorAll('.settings-section h3');
    if (settingsSections[0]) settingsSections[0].textContent = t('store_information');
    if (settingsSections[1]) settingsSections[1].textContent = t('defaults');
    if (settingsSections[2]) settingsSections[2].textContent = t('receipt');
    
    // Settings labels
    const labels = {
      'store_name': t('store_name'),
      'store_phone': t('phone'),
      'store_email': t('email'),
      'store_address': t('address'),
      'tax_number': t('tax_number'),
      'default_tax_rate': t('default_tax_rate'),
      'currency_symbol': t('currency_symbol'),
      'low_stock_threshold': t('low_stock_threshold'),
      'backup_interval': t('backup_interval'),
      'receipt_header': t('receipt_header'),
      'receipt_footer': t('receipt_footer')
    };
    
    Object.entries(labels).forEach(([name, text]) => {
      const input = document.querySelector(`[name="${name}"]`);
      if (input) {
        const label = input.previousElementSibling;
        if (label && label.tagName === 'LABEL') {
          label.textContent = text;
        }
      }
    });
    
    // Save button
    const saveBtn = document.querySelector('#settings-form button[type="submit"]');
    if (saveBtn) saveBtn.textContent = t('save_settings');
  }
  
  // Utilities
  function formatCurrency(amount) {
    const symbol = (state.settings && state.settings.currency_symbol) || 'EGP';
    const num = parseFloat(amount) || 0;
    return `${num.toFixed(2)} ${symbol}`;
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
  
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Function to edit product (calls showProductModal)
  function editProduct(productId) {
    showProductModal(productId);
  }

  // Function to delete product
  async function deleteProduct(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    const result = await window.API.deleteProduct(productId);
    if (result.success) {
      alert('Product deleted successfully!');
      await loadProducts();
    } else {
      alert('Failed to delete product: ' + result.error);
    }
  }

  // Function to adjust stock (placeholder - you can implement a modal for this)
  function adjustStock(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const newStock = prompt(`Current stock: ${product.stock_quantity}\nEnter new stock quantity:`, product.stock_quantity);
    if (newStock === null) return;

    const stockNum = parseInt(newStock);
    if (isNaN(stockNum) || stockNum < 0) {
      alert('Please enter a valid number');
      return;
    }

    // Update product stock
    product.stock_quantity = stockNum;
    window.API.updateProduct(productId, { ...product, stock_quantity: stockNum })
      .then(result => {
        if (result.success) {
          alert('Stock updated successfully!');
          loadProducts();
        } else {
          alert('Failed to update stock');
        }
      });
  }

  // Make functions globally accessible for onclick handlers
  window.addToCart = addToCart;
  window.editProduct = editProduct;
  window.deleteProduct = deleteProduct;
  window.adjustStock = adjustStock;
  window.closeModal = closeModal;
  window.selectProductImage = selectProductImage;
  window.showProductModal = showProductModal;
  window.showExpenseModal = showExpenseModal;
  window.showUserModal = showUserModal;
  
  