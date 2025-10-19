const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Authentication
  login: (credentials) => ipcRenderer.invoke('auth:login', credentials),

  // Products
  getProducts: () => ipcRenderer.invoke('products:getAll'),
  searchProducts: (query) => ipcRenderer.invoke('products:search', query),
  getProduct: (id) => ipcRenderer.invoke('products:getById', id),
  createProduct: (data) => ipcRenderer.invoke('products:create', data),
  updateProduct: (id, data) => ipcRenderer.invoke('products:update', { id, productData: data }),
  deleteProduct: (id) => ipcRenderer.invoke('products:delete', id),
  adjustStock: (data) => ipcRenderer.invoke('products:adjustStock', data),

  // Orders
  createOrder: (data) => ipcRenderer.invoke('orders:create', data),
  getOrders: (params) => ipcRenderer.invoke('orders:getAll', params),
  getOrder: (id) => ipcRenderer.invoke('orders:getById', id),

  // Expenses
  createExpense: (data) => ipcRenderer.invoke('expenses:create', data),
  getExpenses: (params) => ipcRenderer.invoke('expenses:getAll', params),

  // Reports
  getSalesReport: (params) => ipcRenderer.invoke('reports:sales', params),
  getProfitReport: (params) => ipcRenderer.invoke('reports:profit', params),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:getAll'),
  updateSettings: (data) => ipcRenderer.invoke('settings:update', data),

  // Backup
  createBackup: () => ipcRenderer.invoke('backup:create'),
  listBackups: () => ipcRenderer.invoke('backup:list'),
  restoreBackup: (path) => ipcRenderer.invoke('backup:restore', path),
  exportBackup: (name) => ipcRenderer.invoke('backup:export', name),
  importBackup: () => ipcRenderer.invoke('backup:import'),

  // Users
  createUser: (data) => ipcRenderer.invoke('users:create', data),
  getUsers: () => ipcRenderer.invoke('users:getAll'),

  // Printing & PDF
  generatePDF: (data) => ipcRenderer.invoke('print:generatePDF', data),
  printThermal: (orderId) => ipcRenderer.invoke('print:thermal', orderId),
  printReceipt: (orderId) => ipcRenderer.invoke('print:receipt', orderId),

  // File operations
  selectImage: () => ipcRenderer.invoke('file:selectImage'),
  getImagePath: (fileName) => ipcRenderer.invoke('file:getImagePath', fileName)
});

