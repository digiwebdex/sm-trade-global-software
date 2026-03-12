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
    tagline: 'Your Trusted Business Partner',
    address: 'Dhaka, Bangladesh',
    phone: '+880-1XXX-XXXXXX',
    email: 'info@smtrade.com',
    website: 'www.smtrade.com',
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
}
