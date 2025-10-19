// API Adapter - Works with both Electron and Web Server
// Automatically detects the environment and uses the appropriate API

const isElectron = typeof window !== 'undefined' && window.electronAPI;

const API = {
  // Helper function for web API calls
  async callWebAPI(endpoint, method = 'GET', data = null) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Send cookies with requests
      };

      if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`/api${endpoint}`, options);
      
      // Check if response is OK
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`API Error (${response.status}):`, errorData);
        return { 
          success: false, 
          error: errorData.error || errorData.message || `Server error: ${response.status}`,
          message: errorData.error || errorData.message || `Server error: ${response.status}`
        };
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Call Error:', error);
      return { 
        success: false, 
        error: error.message || 'Network error',
        message: error.message || 'Network error - check if server is running'
      };
    }
  },

  // Authentication
  async login(username, password) {
    if (isElectron) {
      return await window.electronAPI.loginUser(username, password);
    } else {
      return await this.callWebAPI('/login', 'POST', { username, password });
    }
  },

  async logout() {
    if (isElectron) {
      return { success: true };
    } else {
      return await this.callWebAPI('/logout', 'POST');
    }
  },

  async getCurrentUser() {
    if (isElectron) {
      return { success: true, user: { username: 'admin', role: 'admin' } };
    } else {
      return await this.callWebAPI('/current-user');
    }
  },

  // Products
  async getAllProducts() {
    if (isElectron) {
      return await window.electronAPI.getAllProducts();
    } else {
      return await this.callWebAPI('/products');
    }
  },

  async getProducts() {
    return await this.getAllProducts();
  },

  async searchProducts(query) {
    if (isElectron) {
      return await window.electronAPI.searchProducts(query);
    } else {
      // For web, just filter products client-side
      const result = await this.getAllProducts();
      if (result.success) {
        const filtered = result.data.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase())
        );
        return { success: true, data: filtered };
      }
      return result;
    }
  },

  async createProduct(productData) {
    if (isElectron) {
      return await window.electronAPI.createProduct(productData);
    } else {
      return await this.callWebAPI('/products', 'POST', productData);
    }
  },

  async updateProduct(id, productData) {
    if (isElectron) {
      return await window.electronAPI.updateProduct(id, productData);
    } else {
      return await this.callWebAPI(`/products/${id}`, 'PUT', productData);
    }
  },

  async deleteProduct(id) {
    if (isElectron) {
      return await window.electronAPI.deleteProduct(id);
    } else {
      return await this.callWebAPI(`/products/${id}`, 'DELETE');
    }
  },

  // Orders
  async getAllOrders() {
    if (isElectron) {
      return await window.electronAPI.getAllOrders();
    } else {
      return await this.callWebAPI('/orders');
    }
  },

  async createOrder(orderData) {
    if (isElectron) {
      return await window.electronAPI.createOrder(orderData);
    } else {
      return await this.callWebAPI('/orders', 'POST', orderData);
    }
  },

  async getOrderById(id) {
    if (isElectron) {
      return await window.electronAPI.getOrderById(id);
    } else {
      return await this.callWebAPI(`/orders/${id}`);
    }
  },

  async getOrder(orderId) {
    return await this.getOrderById(orderId);
  },

  async getOrders(options = {}) {
    return await this.getAllOrders();
  },

  // Expenses
  async getAllExpenses() {
    if (isElectron) {
      return await window.electronAPI.getAllExpenses();
    } else {
      return await this.callWebAPI('/expenses');
    }
  },

  async getExpenses() {
    return await this.getAllExpenses();
  },

  async createExpense(expenseData) {
    if (isElectron) {
      return await window.electronAPI.createExpense(expenseData);
    } else {
      return await this.callWebAPI('/expenses', 'POST', expenseData);
    }
  },

  // Reports
  async generateReport(startDate, endDate) {
    if (isElectron) {
      return await window.electronAPI.generateReport(startDate, endDate);
    } else {
      return await this.callWebAPI('/reports/generate', 'POST', { startDate, endDate });
    }
  },

  async getSalesReport(options) {
    return await this.generateReport(options.startDate, options.endDate);
  },

  async getProfitReport(options) {
    return await this.generateReport(options.startDate, options.endDate);
  },

  async generatePDF(options) {
    if (isElectron) {
      return await window.electronAPI.generatePDF(options);
    } else {
      console.warn('PDF generation not available in web version');
      return { success: false, message: 'PDF generation only available in desktop version' };
    }
  },

  async printThermal(orderId) {
    if (isElectron) {
      return await window.electronAPI.printThermal(orderId);
    } else {
      console.warn('Thermal printing not available in web version');
      return { success: false, message: 'Thermal printing only available in desktop version' };
    }
  },

  // Settings
  async getSettings() {
    if (isElectron) {
      return await window.electronAPI.getSettings();
    } else {
      return await this.callWebAPI('/settings');
    }
  },

  async updateSettings(settings) {
    if (isElectron) {
      return await window.electronAPI.updateSettings(settings);
    } else {
      return await this.callWebAPI('/settings', 'POST', settings);
    }
  },

  // Users
  async getAllUsers() {
    if (isElectron) {
      return await window.electronAPI.getAllUsers();
    } else {
      return await this.callWebAPI('/users');
    }
  },

  async getUsers() {
    return await this.getAllUsers();
  },

  async createUser(userData) {
    if (isElectron) {
      return await window.electronAPI.createUser(userData);
    } else {
      return await this.callWebAPI('/users', 'POST', userData);
    }
  },

  async changePassword(userId, newPassword) {
    if (isElectron) {
      return await window.electronAPI.changePassword(userId, newPassword);
    } else {
      return await this.callWebAPI(`/users/${userId}/password`, 'PUT', { newPassword });
    }
  },

  // Backup
  async createBackup() {
    if (isElectron) {
      return await window.electronAPI.createBackup();
    } else {
      return await this.callWebAPI('/backup/create', 'POST');
    }
  },

  async listBackups() {
    if (isElectron) {
      return await window.electronAPI.listBackups();
    } else {
      return await this.callWebAPI('/backup/list');
    }
  },

  async exportBackup(backupName) {
    if (isElectron) {
      return await window.electronAPI.exportBackup(backupName);
    } else {
      console.warn('Export backup not available in web version');
      return { success: false, message: 'Backup export only available in desktop version' };
    }
  },

  async importBackup() {
    if (isElectron) {
      return await window.electronAPI.importBackup();
    } else {
      console.warn('Import backup not available in web version');
      return { success: false, message: 'Backup import only available in desktop version' };
    }
  },

  // Image/File handling (Electron only)
  async getImagePath(imagePath) {
    if (isElectron) {
      return await window.electronAPI.getImagePath(imagePath);
    } else {
      // In web version, images are served directly
      return { success: true, path: imagePath || '/assets/placeholder.png' };
    }
  },

  async selectImage() {
    if (isElectron) {
      return await window.electronAPI.selectImage();
    } else {
      console.warn('File selection not available in web version');
      return { success: false, message: 'File upload only available in desktop version' };
    }
  },

  // Stock management
  async adjustStock(data) {
    if (isElectron) {
      return await window.electronAPI.adjustStock(data);
    } else {
      // Web version - call API endpoint
      return await this.callWebAPI('/products/adjust-stock', 'POST', data);
    }
  },

  // Printing (only works in Electron)
  async printReceipt(orderData) {
    if (isElectron) {
      return await window.electronAPI.printReceipt(orderData);
    } else {
      console.warn('Printing is not available in web version');
      return { success: true, message: 'Print preview shown (web version)' };
    }
  },

  // Check environment
  isElectron() {
    return isElectron;
  },

  isWeb() {
    return !isElectron;
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  window.API = API;
}

