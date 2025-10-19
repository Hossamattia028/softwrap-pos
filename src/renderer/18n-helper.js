// Helper function to translate text
function t(key) {
    return window.translator ? window.translator.t(key) : key;
  }
  
  // Update all translated elements on the page
  function updateTranslations() {
    if (!window.translator) return;
    
    // Get current language
    const lang = window.translator.getCurrentLanguage();
    const iEGPabic = lang === 'ar';
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach((item, index) => {
      const keys = ['nav_pos', 'nav_products', 'nav_orders', 'nav_expenses', 'nav_reports', 'nav_backup', 'nav_settings', 'nav_users'];
      if (keys[index]) {
        const icon = item.querySelector('.icon');
        const text = t(keys[index]);
        item.innerHTML = `<span class="icon">${icon.textContent}</span> ${text}`;
      }
    });
    
    // Update common buttons and labels
    const translations = {
      'Add Product': 'add_product',
      'Add Expense': 'add_expense',
      'Add User': 'add_user',
      'Create Backup Now': 'create_backup',
      'Import Backup': 'import_backup',
      'Generate Report': 'generate_report',
      'Save Settings': 'save_settings',
      'Clear': 'clear',
      'Complete Sale': 'complete_sale',
      'Logout': 'logout'
    };
    
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim();
      if (translations[text]) {
        btn.textContent = t(translations[text]);
      }
    });
    
    // Update panel headers
    const panelHeaders = {
      'Products Management': 'products_management',
      'Orders History': 'orders_history',
      'Expenses Management': 'expenses_management',
      'Reports & Analytics': 'reports_analytics',
      'Backup & Restore': 'backup_restore',
      'Settings': 'settings',
      'Users Management': 'users_management',
      'Current Order': 'current_order'
    };
    
    document.querySelectorAll('.panel-header h2, .panel-header h3, .cart-header h3').forEach(header => {
      const text = header.textContent.trim();
      if (panelHeaders[text]) {
        header.textContent = t(panelHeaders[text]);
      }
    });
  }
  
  // Call this after page load and language change
  window.updateTranslations = updateTranslations;
  
  