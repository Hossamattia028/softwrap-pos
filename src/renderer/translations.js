// Translation system for Softwrap POS
const translations = {
    en: {
      // Login
      login_title: "Softwrap POS",
      login_subtitle: "Offline Desktop",
      username: "Username",
      password: "Password",
      login_button: "Login",
      logout: "Logout",
      
      // Navigation
      nav_pos: "POS / Checkout",
      nav_products: "Products",
      nav_orders: "Orders",
      nav_expenses: "Expenses",
      nav_reports: "Reports",
      nav_backup: "Backup & Restore",
      nav_settings: "Settings",
      nav_users: "Users",
      
      // POS Screen
      search_products: "Search products by name, SKU, or barcode...",
      current_order: "Current Order",
      clear: "Clear",
      cart_empty: "Cart is empty",
      subtotal: "Subtotal",
      discount: "Discount",
      shipping: "Shipping",
      tax: "Tax",
      total: "Total",
      payment_method: "Payment Method",
      customer_name: "Customer Name (Optional)",
      complete_sale: "Complete Sale",
      cash: "Cash",
      card: "Card",
      wallet: "Wallet",
      credit: "Credit",
      
      // Products
      products_management: "Products Management",
      add_product: "Add Product",
      edit_product: "Edit Product",
      sku: "SKU",
      name: "Name",
      category: "Category",
      price: "Price",
      stock: "Stock",
      actions: "Actions",
      edit: "Edit",
      delete: "Delete",
      description: "Description",
      cost_price: "Cost Price",
      tax_rate: "Tax Rate (%)",
      stock_quantity: "Stock Quantity",
      unit: "Unit",
      update_product: "Update Product",
      product_image: "Product Image",
      choose_image: "Choose Image",
      
      // Orders
      orders_history: "Orders History",
      order_number: "Order #",
      date: "Date",
      customer: "Customer",
      items: "Items",
      status: "Status",
      view: "View",
      order_details: "Order Details",
      download_invoice: "Download Invoice PDF",
      download_receipt: "Download Receipt PDF",
      print_thermal: "Print Thermal",
      
      // Expenses
      expenses_management: "Expenses Management",
      add_expense: "Add Expense",
      title: "Title",
      amount: "Amount",
      notes: "Notes",
      paid_by: "Paid By",
      
      // Reports
      reports_analytics: "Reports & Analytics",
      start_date: "Start Date",
      end_date: "End Date",
      generate_report: "Generate Report",
      total_revenue: "Total Revenue",
      total_orders: "Total Orders",
      gross_profit: "Gross Profit",
      avg_order_value: "Avg Order Value",
      top_selling_products: "Top Selling Products",
      product: "Product",
      sold: "Sold",
      revenue: "Revenue",
      
      // Backup
      backup_restore: "Backup & Restore",
      create_backup: "Create Backup Now",
      import_backup: "Import Backup",
      available_backups: "Available Backups",
      type: "Type",
      size: "Size",
      export: "Export",
      
      // Settings
      settings: "Settings",
      store_information: "Store Information",
      store_name: "Store Name",
      phone: "Phone",
      email: "Email",
      address: "Address",
      tax_number: "Tax Number",
      defaults: "Defaults",
      default_tax_rate: "Default Tax Rate (%)",
      currency_symbol: "Currency Symbol",
      low_stock_threshold: "Low Stock Threshold",
      backup_interval: "Auto Backup Interval (minutes)",
      receipt: "Receipt",
      receipt_header: "Receipt Header",
      receipt_footer: "Receipt Footer",
      save_settings: "Save Settings",
      language: "Language",
      
      // Users
      users_management: "Users Management",
      add_user: "Add User",
      display_name: "Display Name",
      role: "Role",
      admin: "Admin",
      manager: "Manager",
      cashier: "Cashier",
      active: "Active",
      inactive: "Inactive",
      created: "Created",
      
      // Stock adjustment
      adjust_stock: "Adjust Stock",
      current_stock: "Current Stock",
      quantity_change: "Quantity Change (+ or -)",
      reason: "Reason",
      reason_purchase: "Purchase Received",
      reason_return: "Customer Return",
      reason_damage: "Damaged",
      reason_correction: "Stock Correction",
      reason_other: "Other",
      
      // Common
      close: "Close",
      cancel: "Cancel",
      save: "Save",
      submit: "Submit",
      confirm: "Confirm",
      quantity: "Quantity",
      no_results: "No results found",
      choose_image: "Choose Image",
      no_image: "No image",
      or: "or"
    },
    
    ar: {
      // Login
      login_title: "سوفت راب - نقاط البيع",
      login_subtitle: "نظام سطح المكتب",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      login_button: "تسجيل الدخول",
      logout: "تسجيل الخروج",
      
      // Navigation
      nav_pos: "نقطة البيع / الكاشير",
      nav_products: "المنتجات",
      nav_orders: "الطلبات",
      nav_expenses: "المصروفات",
      nav_reports: "التقارير",
      nav_backup: "النسخ الاحتياطي",
      nav_settings: "الإعدادات",
      nav_users: "المستخدمين",
      
      // POS Screen
      search_products: "البحث عن منتج بالاسم أو رقم الصنف...",
      current_order: "الطلب الحالي",
      clear: "مسح",
      cart_empty: "السلة فارغة",
      subtotal: "المجموع الفرعي",
      discount: "الخصم",
      shipping: "الشحن",
      tax: "الضريبة",
      total: "الإجمالي",
      payment_method: "طريقة الدفع",
      customer_name: "اسم العميل (اختياري)",
      complete_sale: "إتمام البيع",
      cash: "نقدي",
      card: "بطاقة",
      wallet: "محفظة",
      credit: "آجل",
      
      // Products
      products_management: "إدارة المنتجات",
      add_product: "إضافة منتج",
      edit_product: "تعديل منتج",
      sku: "رقم الصنف",
      name: "الاسم",
      category: "الفئة",
      price: "السعر",
      stock: "المخزون",
      actions: "الإجراءات",
      edit: "تعديل",
      delete: "حذف",
      description: "الوصف",
      cost_price: "سعر التكلفة",
      tax_rate: "معدل الضريبة (%)",
      stock_quantity: "كمية المخزون",
      unit: "الوحدة",
      update_product: "تحديث المنتج",
      product_image: "صورة المنتج",
      choose_image: "اختر صورة",
      
      // Orders
      orders_history: "سجل الطلبات",
      order_number: "رقم الطلب",
      date: "التاريخ",
      customer: "العميل",
      items: "الأصناف",
      status: "الحالة",
      view: "عرض",
      order_details: "تفاصيل الطلب",
      download_invoice: "تحميل الفاتورة PDF",
      download_receipt: "تحميل الإيصال PDF",
      print_thermal: "طباعة حرارية",
      
      // Expenses
      expenses_management: "إدارة المصروفات",
      add_expense: "إضافة مصروف",
      title: "العنوان",
      amount: "المبلغ",
      notes: "ملاحظات",
      paid_by: "دفعت بواسطة",
      
      // Reports
      reports_analytics: "التقارير والتحليلات",
      start_date: "تاريخ البداية",
      end_date: "تاريخ النهاية",
      generate_report: "إنشاء تقرير",
      total_revenue: "إجمالي الإيرادات",
      total_orders: "عدد الطلبات",
      gross_profit: "إجمالي الربح",
      avg_order_value: "متوسط قيمة الطلب",
      top_selling_products: "المنتجات الأكثر مبيعاً",
      product: "المنتج",
      sold: "المباع",
      revenue: "الإيرادات",
      
      // Backup
      backup_restore: "النسخ الاحتياطي والاستعادة",
      create_backup: "إنشاء نسخة احتياطية",
      import_backup: "استيراد نسخة احتياطية",
      available_backups: "النسخ الاحتياطية المتوفرة",
      type: "النوع",
      size: "الحجم",
      export: "تصدير",
      
      // Settings
      settings: "الإعدادات",
      store_information: "معلومات المتجر",
      store_name: "اسم المتجر",
      phone: "الهاتف",
      email: "البريد الإلكتروني",
      address: "العنوان",
      tax_number: "الرقم الضريبي",
      defaults: "الإعدادات الافتراضية",
      default_tax_rate: "معدل الضريبة الافتراضي (%)",
      currency_symbol: "رمز العملة",
      low_stock_threshold: "حد التنبيه للمخزون المنخفض",
      backup_interval: "مدة النسخ الاحتياطي التلقائي (دقائق)",
      receipt: "الإيصال",
      receipt_header: "رأس الإيصال",
      receipt_footer: "تذييل الإيصال",
      save_settings: "حفظ الإعدادات",
      language: "اللغة",
      
      // Users
      users_management: "إدارة المستخدمين",
      add_user: "إضافة مستخدم",
      display_name: "الاسم المعروض",
      role: "الدور",
      admin: "مدير",
      manager: "مشرف",
      cashier: "كاشير",
      active: "نشط",
      inactive: "غير نشط",
      created: "تاريخ الإنشاء",
      
      // Stock adjustment
      adjust_stock: "تعديل المخزون",
      current_stock: "المخزون الحالي",
      quantity_change: "تغيير الكمية (+ أو -)",
      reason: "السبب",
      reason_purchase: "استلام مشتريات",
      reason_return: "مرتجع من عميل",
      reason_damage: "تالف",
      reason_correction: "تصحيح مخزون",
      reason_other: "أخرى",
      
      // Common
      close: "إغلاق",
      cancel: "إلغاء",
      save: "حفظ",
      submit: "إرسال",
      confirm: "تأكيد",
      quantity: "الكمية",
      no_results: "لا توجد نتائج",
      choose_image: "اختر صورة",
      no_image: "لا توجد صورة",
      or: "أو"
    }
  };
  
  // Translation helper
  class Translator {
    constructor() {
      this.currentLang = localStorage.getItem('app_language') || 'ar'; // Default to Arabic
      this.applyDirection();
    }
    
    t(key) {
      return translations[this.currentLang][key] || key;
    }
    
    setLanguage(lang) {
      this.currentLang = lang;
      localStorage.setItem('app_language', lang);
      this.applyDirection();
    }
    
    getCurrentLanguage() {
      return this.currentLang;
    }
    
    applyDirection() {
      const html = document.documentElement;
      if (this.currentLang === 'ar') {
        html.setAttribute('dir', 'rtl');
        html.setAttribute('lang', 'ar');
      } else {
        html.setAttribute('dir', 'ltr');
        html.setAttribute('lang', 'en');
      }
    }
    
    translatePage() {
      // Translate all elements with data-i18n attribute
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = this.t(key);
        
        if (element.tagName === 'INPUT' && element.type !== 'submit') {
          element.placeholder = translation;
        } else {
          element.textContent = translation;
        }
      });
    }
  }
  
  // Export
  window.translator = new Translator();
  
  