// localStorage-based data store - easily replaceable with REST API calls

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  // Generic CRUD
  getAll: <T>(key: string): T[] => getItem<T[]>(key, []),
  getById: <T extends { id: string }>(key: string, id: string): T | undefined => {
    return getItem<T[]>(key, []).find(item => item.id === id);
  },
  create: <T extends { id: string }>(key: string, item: T): T => {
    const items = getItem<T[]>(key, []);
    items.push(item);
    setItem(key, items);
    return item;
  },
  update: <T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | undefined => {
    const items = getItem<T[]>(key, []);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return undefined;
    items[index] = { ...items[index], ...updates };
    setItem(key, items);
    return items[index];
  },
  remove: <T extends { id: string }>(key: string, id: string): boolean => {
    const items = getItem<T[]>(key, []);
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;
    setItem(key, filtered);
    return true;
  },

  // Company settings
  getSettings: () => getItem('companySettings', {
    name: 'S. M. Trade International',
    tagline: '1st Class Govt. Contractor, Supplier & Importer',
    address: 'House # 7, Road # 19/A, Sector # 4, Uttara, Dhaka-1230',
    phone: '+8801886766688',
    email: 'info@smtradeint.com',
    website: 'smtradeint.com',
    logo: '',
  }),
  saveSettings: (settings: any) => setItem('companySettings', settings),
};

// Storage keys
export const KEYS = {
  USERS: 'sm_users',
  CUSTOMERS: 'sm_customers',
  PRODUCTS: 'sm_products',
  INVOICES: 'sm_invoices',
  QUOTATIONS: 'sm_quotations',
  CHALLANS: 'sm_challans',
  PURCHASE_ORDERS: 'sm_purchase_orders',
};

// Initialize default admin user if none exists
export function initializeData() {
  const users = storage.getAll(KEYS.USERS);
  if (users.length === 0) {
    storage.create(KEYS.USERS, {
      id: 'admin-1',
      username: 'admin',
      password: 'admin123',
      name: 'Administrator',
      role: 'admin',
      email: 'admin@smtrade.com',
      createdAt: new Date().toISOString(),
    });
  }

  // Sample Customers
  const customers = storage.getAll(KEYS.CUSTOMERS);
  if (customers.length === 0) {
    const sampleCustomers = [
      {
        id: 'cust-1',
        name: 'Course Director, 79th Foundation Training Course',
        organization: 'Bangladesh Public Administration Training Centre',
        address: 'BPATC, Savar, Dhaka-1343',
        phone: '+8801711000001',
        email: 'bpatc79@gov.bd',
        createdAt: '2026-01-15T10:00:00.000Z',
      },
      {
        id: 'cust-2',
        name: 'Md. Rafiqul Islam',
        organization: 'Dhaka City Corporation',
        address: 'Nagar Bhaban, Dhaka-1000',
        phone: '+8801711000002',
        email: 'rafiq@dcc.gov.bd',
        createdAt: '2026-01-16T10:00:00.000Z',
      },
      {
        id: 'cust-3',
        name: 'Fatema Begum',
        organization: 'Ministry of Education',
        address: 'Bangladesh Secretariat, Dhaka-1000',
        phone: '+8801711000003',
        email: 'fatema@moe.gov.bd',
        createdAt: '2026-01-17T10:00:00.000Z',
      },
    ];
    sampleCustomers.forEach(c => storage.create(KEYS.CUSTOMERS, c));
  }

  // Sample Products
  const products = storage.getAll(KEYS.PRODUCTS);
  if (products.length === 0) {
    const sampleProducts = [
      { id: 'prod-1', name: '79th FTC Ribbon 2 CM', description: 'Foundation Training Course Ribbon 2 CM width', unitPrice: 150, unitType: 'Pcs', createdAt: '2026-01-10T10:00:00.000Z' },
      { id: 'prod-2', name: 'Transparent VIP ID Card Holder', description: 'Transparent VIP ID Card Holder - Premium Quality', unitPrice: 130, unitType: 'Pcs', createdAt: '2026-01-10T10:00:00.000Z' },
      { id: 'prod-3', name: 'Pad', description: 'Writing Pad - A4 Size', unitPrice: 150, unitType: 'Pcs', createdAt: '2026-01-10T10:00:00.000Z' },
      { id: 'prod-4', name: 'Seminar File', description: 'Seminar File - Premium Quality', unitPrice: 150, unitType: 'Pcs', createdAt: '2026-01-10T10:00:00.000Z' },
      { id: 'prod-5', name: 'Pen', description: 'Ball Point Pen - Blue Ink', unitPrice: 150, unitType: 'Pcs', createdAt: '2026-01-10T10:00:00.000Z' },
    ];
    sampleProducts.forEach(p => storage.create(KEYS.PRODUCTS, p));
  }

  // Sample Invoice
  const invoices = storage.getAll(KEYS.INVOICES);
  if (invoices.length === 0) {
    const vipItems = Array.from({ length: 20 }, (_, i) => ({
      id: `li-${i + 2}`,
      description: 'Transparent VIP ID Card Holder',
      quantity: 430,
      unitPrice: 130,
      total: 55900,
    }));
    const allItems = [
      { id: 'li-1', description: '79th FTC Ribbon 2 CM', quantity: 430, unitPrice: 150, total: 64500 },
      ...vipItems,
    ];
    storage.create(KEYS.INVOICES, {
      id: 'inv-1',
      invoiceNumber: 'INV-2026-012',
      date: '2026-01-21',
      customerId: 'cust-1',
      customerName: 'Course Director, 79th Foundation Training Course',
      customerAddress: 'Bangladesh Public Administration Training Centre',
      customerPhone: '+8801711000001',
      items: allItems,
      totalAmount: allItems.reduce((s, i) => s + i.total, 0),
      status: 'sent',
      notes: '',
      createdAt: '2026-01-21T10:00:00.000Z',
    });
  }

  // Sample Quotation
  const quotations = storage.getAll(KEYS.QUOTATIONS);
  if (quotations.length === 0) {
    storage.create(KEYS.QUOTATIONS, {
      id: 'qt-1',
      quotationNumber: 'QTS-2026-0001',
      date: '2026-01-21',
      customerId: 'cust-1',
      customerName: 'Course Director, 79th Foundation Training Course',
      customerAddress: 'Bangladesh Public Administration Training Centre',
      customerPhone: '+8801711000001',
      items: [
        { id: 'qi-1', description: 'Pad', quantity: 150, unitPrice: 150, total: 22500 },
        { id: 'qi-2', description: 'Seminar File', quantity: 150, unitPrice: 150, total: 22500 },
        { id: 'qi-3', description: 'Pen', quantity: 150, unitPrice: 150, total: 22500 },
      ],
      totalAmount: 67500,
      status: 'sent',
      validUntil: '2026-02-21',
      notes: '',
      createdAt: '2026-01-21T10:00:00.000Z',
    });
  }

  // Sample Challan
  const challans = storage.getAll(KEYS.CHALLANS);
  if (challans.length === 0) {
    storage.create(KEYS.CHALLANS, {
      id: 'cln-1',
      challanNumber: 'CLN-2026-0001',
      date: '2026-01-21',
      orderNo: '167',
      customerId: 'cust-1',
      customerName: 'Course Director, 79th Foundation Training Course',
      customerAddress: 'Bangladesh Public Administration Training Centre',
      customerPhone: '+8801711000001',
      items: [
        { id: 'ci-1', itemName: 'Pad', details: '', size: '', deliveryQty: 150, balanceQty: 0, unit: 'Pcs' },
        { id: 'ci-2', itemName: 'Seminar File', details: '', size: '', deliveryQty: 310, balanceQty: 0, unit: 'Pcs' },
        { id: 'ci-3', itemName: 'Pen', details: '', size: '', deliveryQty: 330, balanceQty: 0, unit: 'Pcs' },
      ],
      totalQuantity: 790,
      status: 'delivered',
      notes: '',
      createdAt: '2026-01-21T10:00:00.000Z',
    });
  }

  // Sample Purchase Order
  const purchaseOrders = storage.getAll(KEYS.PURCHASE_ORDERS);
  if (purchaseOrders.length === 0) {
    storage.create(KEYS.PURCHASE_ORDERS, {
      id: 'po-1',
      poNumber: 'PO-2026-0001',
      date: '2026-01-18',
      supplierName: 'ABC Stationery Suppliers',
      supplierAddress: 'Islampur, Dhaka-1100',
      supplierPhone: '+8801811000001',
      supplierEmail: 'abc@supplier.com',
      items: [
        { id: 'pi-1', description: 'Pad - A4 Size', quantity: 200, unitPrice: 100, total: 20000 },
        { id: 'pi-2', description: 'Seminar File', quantity: 200, unitPrice: 100, total: 20000 },
        { id: 'pi-3', description: 'Pen - Blue Ink', quantity: 200, unitPrice: 80, total: 16000 },
      ],
      totalAmount: 56000,
      status: 'sent',
      notes: '',
      createdAt: '2026-01-18T10:00:00.000Z',
    });
  }
}
